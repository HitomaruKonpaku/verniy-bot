import { hideLinkEmbed } from '@discordjs/builders'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ETwitterStreamEvent, TweetStream, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TrackTwitterTweetService } from '../../database/services/track-twitter-tweet.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterRuleUtils } from '../utils/TwitterRuleUtils'
import { TwitterUtils } from '../utils/TwitterUtils'
import { TwitterApiService } from './twitter-api.service'
import { TwitterClientService } from './twitter-client.service'

@Injectable()
export class TwitterTweetTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterTweetTrackingService.name })

  private stream: TweetStream<TweetV2SingleStreamResult>

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterClientService)
    private readonly twitterClientService: TwitterClientService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.initStream()
  }

  private get client() {
    return this.twitterClientService.roClient
  }

  public async start() {
    this.logger.info('Starting...')
    await this.initUsers()
    await this.initStreamRules()
    await this.connect()
  }

  public async connect(retryCount = 0) {
    try {
      this.logger.info('Connecting')
      await this.stream.connect({ autoReconnect: true })
    } catch (error) {
      this.logger.error(`connect: ${error.message}`)
      const ms = ([10, 20, 30][retryCount] || 60) * 1000
      this.logger.info(`connect: Retry in ${ms}ms`)
      await Utils.sleep(ms)
      this.connect(retryCount + 1)
    }
  }

  public close() {
    return this.stream.close()
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
    stream.on(ev.ReconnectError, (error) => this.logger.error(`ReconnectError: ${error}`))
    stream.on(ev.ReconnectAttempt, (tries) => this.logger.warn(`ReconnectAttempt: ${tries}`))
    stream.on(ev.ReconnectLimitExceeded, () => this.logger.error('ReconnectLimitExceeded'))
    stream.on(ev.Reconnected, () => this.logger.info('Reconnected'))
    stream.on(ev.Data, (data) => this.onData(data))
  }

  private async initUsers() {
    try {
      const userIds = await this.trackTwitterTweetService.getTwitterUserIds()
      const chunks = Utils.splitArrayIntoChunk(userIds, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.getUsers(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async getUsers(userIds: string[], retryCount = 0) {
    if (!userIds?.length) {
      return
    }
    try {
      const users = await this.twitterApiService.getUsersByUserIds(userIds)
      await Promise.allSettled(users.map((v) => this.twitterUserService.updateByUserObject(v)))
    } catch (error) {
      this.logger.error(`getUsers: ${error.message}`)
      const ms = ([10, 20][retryCount] || 30) * 1000
      this.logger.warn(`getUsers: Users not found, retry in ${ms}ms`, { userCount: userIds.length, userIds })
      await Utils.sleep(ms)
      this.getUsers(userIds, retryCount + 1)
    }
  }

  private async initStreamRules(retryCount = 0) {
    try {
      const usernames = await this.trackTwitterTweetService.getTwitterUsernames()
      const newStreamRules = TwitterRuleUtils.buildStreamRulesByUsernames(
        usernames,
        this.configService.twitter.tweet.ruleLength,
      )
      const curStreamRules = (await this.client.v2.streamRules()).data || []
      this.logger.info('curStreamRules', { length: curStreamRules.length })
      this.logger.info('newStreamRules', { length: newStreamRules.length })
      if (newStreamRules.length > this.configService.twitter.tweet.ruleLimit) {
        this.logger.error(`initStreamRules: Rule size (${newStreamRules.length}) exceed maximum limit (${this.configService.twitter.tweet.ruleLimit})`)
        this.logger.error('initStreamRules: Cancelled')
        return
      }
      this.logger.debug('curStreamRules', { rules: curStreamRules.map((v) => v.value) })
      this.logger.debug('newStreamRules', { rules: newStreamRules })
      const isMatch = true
        && newStreamRules.length === curStreamRules.length
        && newStreamRules.every((value) => curStreamRules.some((rule) => rule.value === value))
      if (isMatch) {
        this.logger.info('initStreamRules: No update')
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
      this.logger.info('initStreamRules: Update completed')
    } catch (error) {
      this.logger.error(`initStreamRules: ${error.message}`)
      const ms = ([10, 20, 30][retryCount] || 60) * 1000
      this.logger.info(`initStreamRules: Retry in ${ms}ms`)
      await Utils.sleep(ms)
      await this.initStreamRules(retryCount + 1)
    }
  }

  private onError(error) {
    this.logger.error(`Error: ${error.message}`)
  }

  private async onData(data: TweetV2SingleStreamResult) {
    try {
      const { author_id: authorId } = data.data
      const isAuthorExist = await this.trackTwitterTweetService.existTwitterUserId(authorId)
      if (!isAuthorExist) {
        return
      }

      const author = TwitterUtils.getIncludesUserById(data, authorId)
      const tweetUrl = TwitterUtils.getTweetUrl(author.username, data.data.id)
      const channelIds = await this.getDiscordChannelIds(data)
      if (!channelIds.length) {
        this.logger.debug(`onTweet: ${tweetUrl}`)
        return
      }

      this.logger.info(`onTweet: ${tweetUrl}`)
      let content: string = tweetUrl
      try {
        if (TwitterUtils.isReplyStatus(data)) {
          const originTweetUrl = TwitterUtils.getReplyStatusUrl(data)
          content = [tweetUrl, `💬 ${originTweetUrl}`].join('\n')
        } else if (TwitterUtils.isRetweetStatus(data)) {
          const originTweetUrl = TwitterUtils.getRetweetStatusUrl(data)
          content = [hideLinkEmbed(tweetUrl), `🔁 ${originTweetUrl}`].join('\n')
        }
      } catch (error) {
        this.logger.error(`onData: Parsing tweet error: ${error.message}`)
      }

      this.logger.info('Channels', { id: channelIds })
      channelIds.forEach((channelId) => {
        this.discordService.sendToChannel(channelId, { content })
      })
    } catch (error) {
      this.logger.error(`onData: ${error.message}`, { data })
    }
  }

  private async getDiscordChannelIds(data: TweetV2SingleStreamResult) {
    let channelIds = []
    try {
      const author = TwitterUtils.getIncludesUserById(data, data.data.author_id)
      const isReply = TwitterUtils.isReplyStatus(data)
      const isRetweet = TwitterUtils.isRetweetStatus(data)
      const records = await this.trackTwitterTweetService.getManyByTwitterUserId(
        author.id,
        {
          allowReply: isReply,
          allowRetweet: isRetweet,
        },
      )
      channelIds = records
        .filter((record) => {
          if (!record?.filterKeywords?.length) {
            return true
          }
          const entities = data.data?.entities
          const text = data.data.text || ''
          const urls = entities?.urls?.map?.((v) => v.expanded_url) || []
          const contents = [text, ...urls].filter((v) => v).map((v) => v.toLowerCase())
          // eslint-disable-next-line max-len
          const existKeyword = record.filterKeywords.some((keyword) => contents.some((v) => v.includes(keyword.toLowerCase())))
          return existKeyword
        })
        .map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getDiscordChannelIds: ${error.message}`, { data })
    }
    return channelIds
  }
}
