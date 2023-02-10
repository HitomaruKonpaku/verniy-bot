import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { hideLinkEmbed } from 'discord.js'
import { EventEmitter } from 'events'
import { ETwitterStreamEvent, TweetStream, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { AppUtil } from '../../../../util/app.util'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitterTweetService } from '../../../track/service/track-twitter-tweet.service'
import { TwitterRuleUtil } from '../../util/twitter-rule.util'
import { TwitterUtil } from '../../util/twitter.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterClientService } from '../api/twitter-client.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../data/twitter-filtered-stream-user.service'

@Injectable()
export class TwitterTweetTrackingService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterTweetTrackingService.name })

  private stream: TweetStream<TweetV2SingleStreamResult>

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterClientService)
    private readonly twitterClientService: TwitterClientService,
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    super()
  }

  private get client() {
    return this.twitterClientService.roClient
  }

  public async start() {
    this.logger.info('Starting...')
    this.initStream()
    await this.initUsers()
    await this.initStreamRules()
    await this.connect()
  }

  public async connect(retryCount = 0) {
    try {
      this.logger.info('Connecting...')
      await this.stream.connect({ autoReconnect: true })
    } catch (error) {
      this.logger.error(`connect: ${error.message}`)
      const retryMs = ([10, 20, 30][retryCount] || 60) * 1000
      this.logger.info(`connect: Retry in ${retryMs}ms`)
      await AppUtil.sleep(retryMs)
      this.connect(retryCount + 1)
    }
  }

  public close() {
    return this.stream.close()
  }

  public async reloadStreamRules() {
    this.logger.warn('reloadStreamRules')
    await this.initStreamRules()
  }

  private initStream() {
    this.stream = this.client.v2.searchStream({
      autoConnect: false,
      expansions: ['author_id', 'in_reply_to_user_id', 'referenced_tweets.id', 'referenced_tweets.id.author_id'],
      'tweet.fields': ['id', 'author_id', 'in_reply_to_user_id', 'entities'],
      'user.fields': ['id', 'username'],
    })
    this.addStreamEventListeners()
  }

  private addStreamEventListeners() {
    const { stream } = this
    const ev = ETwitterStreamEvent

    stream.on(ev.Error, (error) => this.onError(error))
    stream.on(ev.ConnectError, (error) => this.logger.error(`ConnectError: ${error}`))
    stream.on(ev.Connected, () => this.logger.info('Connected'))
    stream.on(ev.ConnectionLost, () => this.logger.error('ConnectionLost'))
    stream.on(ev.ConnectionClosed, () => this.logger.error('ConnectionClosed'))
    stream.on(ev.ConnectionClosed, () => this.onConnectionClosed())
    stream.on(ev.ReconnectError, (error) => this.logger.error(`ReconnectError: ${error}`))
    stream.on(ev.ReconnectAttempt, (tries) => this.logger.warn(`ReconnectAttempt: ${tries}`))
    stream.on(ev.ReconnectLimitExceeded, () => this.logger.error('ReconnectLimitExceeded'))
    stream.on(ev.Reconnected, () => this.logger.info('Reconnected'))

    stream.on(ev.Data, (data) => this.onData(data))
    stream.on(ev.Data, (data) => this.emit(ETwitterStreamEvent.Data, data))
  }

  private async initUsers() {
    this.logger.debug('initUsers')
    try {
      const userIds = await this.twitterFilteredStreamUserService.getIdsForInitUsers()
      if (!userIds.length) {
        return
      }
      const users = await this.twitterApiService.getAllUsersByUserIds(userIds)
      if (userIds.length !== users.length) {
        const missingIds = userIds.filter((id) => !users.some((user) => user.id_str === id))
        this.logger.warn('initUsers: Failed to get some users by ids', { idCount: missingIds, ids: missingIds })
      }
      await Promise.allSettled(users.map((v) => this.twitterUserControllerService.saveUser(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async initStreamRules(retryCount = 0) {
    this.logger.debug('initStreamRules')
    try {
      const users = await this.twitterFilteredStreamUserService.getUsersForInitRules()
      const usernames = users
        // .map((v) => v.username)
        .map((v) => (v.username.length < v.id.length ? v.username : v.id))
      this.logger.debug('initStreamRules: buildStreamRules', { userCount: usernames.length })
      const newStreamRules = TwitterRuleUtil.buildStreamRulesByUsernames(
        usernames,
        this.configService.twitter.tweet.ruleLength,
      )
      const curStreamRules = (await this.client.v2.streamRules()).data || []
      this.logger.info('initStreamRules: curStreamRules', {
        length: curStreamRules.length,
        sizes: curStreamRules.map((v) => v.value.length).sort((a, b) => b - a),
      })
      this.logger.info('initStreamRules: newStreamRules', {
        length: newStreamRules.length,
        sizes: newStreamRules.map((v) => v.length),
      })
      if (newStreamRules.length > this.configService.twitter.tweet.ruleLimit) {
        this.logger.error(`initStreamRules: Rule size (${newStreamRules.length}) exceed maximum limit (${this.configService.twitter.tweet.ruleLimit})`)
        this.logger.error('initStreamRules: Cancelled')
        return
      }
      this.logger.debug('initStreamRules: curStreamRulesDetail', {
        rules: curStreamRules
          .map((v) => v.value)
          .sort((a, b) => b.length - a.length || a.localeCompare(b)),
      })
      this.logger.debug('initStreamRules: newStreamRulesDetail', {
        rules: newStreamRules
          .sort((a, b) => b.length - a.length || a.localeCompare(b)),
      })
      const isMatch = true
        && newStreamRules.length === curStreamRules.length
        && newStreamRules.every((value) => curStreamRules.some((rule) => rule.value === value))
      if (isMatch) {
        this.logger.info('initStreamRules: Skip')
        return
      }
      if (curStreamRules.length) {
        await this.client.v2.updateStreamRules(
          { delete: { ids: curStreamRules.map((v) => v.id) } },
        )
      }
      await this.client.v2.updateStreamRules({
        add: newStreamRules.map((v) => ({ value: v })),
      })
      this.logger.warn('initStreamRules: Updated')
    } catch (error) {
      this.logger.error(`initStreamRules: ${error.message}`)
      const retryMs = ([5, 10, 20][retryCount] || 30) * 1000
      this.logger.info(`initStreamRules: Retry in ${retryMs}ms`)
      await AppUtil.sleep(retryMs)
      await this.initStreamRules(retryCount + 1)
    }
  }

  private onError(error) {
    this.logger.error(`Error: ${error.message}`)
  }

  private onConnectionClosed() {
    this.connect()
  }

  private async onData(data: TweetV2SingleStreamResult) {
    try {
      const { author_id: authorId } = data.data
      const isAuthorExist = await this.trackTwitterTweetService.existUserId(authorId)
      if (!isAuthorExist) {
        return
      }

      const author = TwitterUtil.getIncludesUserById(data, authorId)
      const tweetUrl = TwitterUtil.getTweetUrl(author.username, data.data.id)
      const trackItems = await this.getTrackItems(data)
      if (!trackItems.length) {
        return
      }

      this.logger.info(`onTweet: ${tweetUrl}`)
      let content: string = tweetUrl
      try {
        if (TwitterUtil.isReplyStatus(data)) {
          const originTweetUrl = TwitterUtil.getReplyStatusUrl(data)
          const icon = '💬'
          content = [
            originTweetUrl,
            `${icon} ${tweetUrl}`,
          ].join('\n')
        } else if (TwitterUtil.isRetweetStatus(data)) {
          const originTweetUrl = TwitterUtil.getRetweetStatusUrl(data)
          const icon = '🔁'
          content = [
            hideLinkEmbed(originTweetUrl),
            `${icon} ${tweetUrl}`,
          ].join('\n')
        }
      } catch (error) {
        this.logger.error(`onData: Parsing tweet error: ${error.message}`, { data })
      }

      trackItems.forEach((trackItem) => {
        const channelContent = [trackItem.discordMessage, content]
          .filter((v) => v)
          .join('\n')
        this.discordService.sendToChannel(
          trackItem.discordChannelId,
          { content: channelContent },
        )
      })
    } catch (error) {
      this.logger.error(`onData: ${error.message}`, { data })
    }
  }

  private async getTrackItems(data: TweetV2SingleStreamResult) {
    try {
      const author = TwitterUtil.getIncludesUserById(data, data.data.author_id)
      const isReply = TwitterUtil.isReplyStatus(data)
      const isRetweet = TwitterUtil.isRetweetStatus(data)
      let items = await this.trackTwitterTweetService.getManyByUserId(
        author.id,
        {
          allowReply: isReply,
          allowRetweet: isRetweet,
        },
      )
      items = items
        .filter((record) => {
          if (!record?.filterKeywords?.length) {
            return true
          }
          const text = data.data.text || ''
          const urls = TwitterUtil.getTweetEntityUrls(data)
          const contents = [text, ...urls].filter((v) => v).map((v) => v.toLowerCase())
          const existKeyword = record.filterKeywords.some((keyword) => contents.some((v) => v.includes(keyword.toLowerCase())))
          return existKeyword
        })
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { data })
    }
    return []
  }
}
