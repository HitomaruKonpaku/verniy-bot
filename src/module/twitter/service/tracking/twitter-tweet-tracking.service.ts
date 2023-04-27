import { forwardRef, Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { hideLinkEmbed } from 'discord.js'
import { EventEmitter } from 'events'
import { ETwitterStreamEvent, TweetStream, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { AppUtil } from '../../../../util/app.util'
import { ArrayUtil } from '../../../../util/array.util'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitterTweetService } from '../../../track/service/track-twitter-tweet.service'
import { TwitterTweet } from '../../model/twitter-tweet.entity'
import { TwitterRuleUtil } from '../../util/twitter-rule.util'
import { TwitterUtil } from '../../util/twitter.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterClientService } from '../api/twitter-client.service'
import { TwitterGraphqlUserService } from '../api/twitter-graphql-user.service'
import { TwitterTweetControllerService } from '../controller/twitter-tweet-controller.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../data/twitter-filtered-stream-user.service'
import { TwitterTweetService } from '../data/twitter-tweet.service'

@Injectable()
export class TwitterTweetTrackingService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterTweetTrackingService.name })

  /**
   * Limit send per discord channel id
   */
  private readonly broadcastLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  private interval = 10000

  private stream: TweetStream<TweetV2SingleStreamResult>

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterClientService)
    private readonly twitterClientService: TwitterClientService,
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterTweetControllerService)
    private readonly twitterTweetControllerService: TwitterTweetControllerService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterGraphqlUserService)
    private readonly twitterGraphqlUserService: TwitterGraphqlUserService,
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
    // this.initStream()
    // await this.initUsers()
    // await this.initStreamRules()
    // await this.connect()
    await this.checkUserTweets()
  }

  // #region new tracker

  private async checkUserTweets() {
    this.logger.debug('--> checkUserTweets')

    try {
      const users = await this.twitterFilteredStreamUserService.getUsersForInitRules()
      if (users.length) {
        this.logger.debug('checkUserTweets', { userCount: users.length })
        const userIds = users.map((v) => v.id)
        await Promise.allSettled(userIds.map((id) => this.getUserTweets(id)))
      }
    } catch (error) {
      this.logger.error(`checkUserTweets: ${error.message}`)
    }

    setTimeout(() => this.checkUserTweets(), this.interval)
    this.logger.debug('<-- checkUserTweets')
  }

  private async getUserTweets(userId: string) {
    try {
      const data = await this.twitterGraphqlUserService.getUserTweetsAndReplies(userId)
      const entries = data.user.result.timeline_v2.timeline.instructions.find((v) => v.type === 'TimelineAddEntries')?.entries || []
      const itemContents = entries.map((v) => v.content.itemContent).filter((v) => v) || []
      // eslint-disable-next-line no-underscore-dangle
      const tweetResults = itemContents.map((v) => v.tweet_results.result).filter((v) => v && v.__typename === 'Tweet') || []
      // this.logger.debug('getUserTweets', { userId, resultCount: tweetResults.length })
      await this.handleTweetResults(tweetResults)
    } catch (error) {
      this.logger.error(`getUserTweets: ${error.message}`, { userId })
    }
  }

  private async handleTweetResults(results: any[]) {
    try {
      const curTweetIds = results.map((v) => v.rest_id)
      const oldTweetIds = await this.twitterTweetService.getManyByIds(curTweetIds).then((tweets) => tweets.map((tweet) => tweet.id))
      const newTweetIds = ArrayUtil.difference(curTweetIds, oldTweetIds)
      if (!newTweetIds.length) {
        return
      }

      const limiter = new Bottleneck({ maxConcurrent: 1 })
      const newResults = results.filter((v) => newTweetIds.includes(v.rest_id)).reverse()
      await Promise.allSettled(newResults.map((result) => limiter.schedule(async () => this.handleTweetResult(result))))
    } catch (error) {
      this.logger.error(`handleTweetResults: ${error.message}`, { results })
    }
  }

  private async handleTweetResult(result: any) {
    try {
      const tweet = await this.twitterTweetControllerService.saveTweet(result)
      await this.broadcastTweet(tweet)
    } catch (error) {
      this.logger.error(`handleTweetResult: ${error.message}`, { result })
    }
  }

  private async broadcastTweet(tweet: TwitterTweet) {
    try {
      const trackItems = await this.getTrackItemsByTweet(tweet)
      if (!trackItems.length) {
        return
      }

      let tweetUrl = TwitterUtil.getTweetUrlById(tweet.id)
      try {
        tweetUrl = TwitterUtil.getTweetUrl(tweet.author.username, tweet.id)
      } catch (error) {
        this.logger.error(`broadcastTweet#getTweetUrl: ${error.message}`, { tweet })
      }
      this.logger.info(`broadcastTweet: ${tweetUrl}`)

      let content = tweetUrl
      try {
        if (tweet.inReplyToStatusId) {
          const icon = '💬'
          const origTweetUrl = TwitterUtil.getTweetUrlById(tweet.inReplyToStatusId)
          content = [origTweetUrl, `${icon} ${tweetUrl}`].join('\n')
        } else if (tweet.retweetedStatusId) {
          const icon = '🔁'
          const origTweetUrl = TwitterUtil.getTweetUrlById(tweet.retweetedStatusId)
          content = [origTweetUrl, `${icon} ${tweetUrl}`].join('\n')
        }
      } catch (error) {
        this.logger.error(`broadcastTweet: Parsing tweet error: ${error.message}`, { tweet })
      }

      trackItems.forEach((trackItem) => {
        const channelContent = [trackItem.discordMessage, content]
          .filter((v) => v)
          .join('\n')
        this.broadcastLimiter
          .key(trackItem.discordChannelId)
          .schedule(() => this.discordService.sendToChannel(
            trackItem.discordChannelId,
            { content: channelContent },
          ))
      })
    } catch (error) {
      this.logger.error(`broadcastTweet: ${error.message}`, { tweet })
    }
  }

  private async getTrackItemsByTweet(tweet: TwitterTweet) {
    try {
      const items = await this.trackTwitterTweetService.getManyByUserId(
        tweet.authorId,
        {
          allowReply: !!tweet.inReplyToStatusId,
          allowRetweet: !!tweet.retweetedStatusId,
        },
      )
      return items
    } catch (error) {
      this.logger.error(`getTrackItemsByTweet: ${error.message}`, { tweet })
    }
    return []
  }

  // #endregion

  // #region legacy tracker

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
      'tweet.fields': ['id', 'created_at', 'author_id', 'lang', 'text', 'in_reply_to_user_id', 'referenced_tweets', 'entities'],
      'user.fields': ['id', 'created_at', 'username', 'name', 'protected', 'verified', 'verified_type'],
    })
    this.addStreamEventListeners()
  }

  private addStreamEventListeners() {
    const { stream } = this
    const ev = ETwitterStreamEvent

    stream.on(ev.Error, (error) => this.onError(error))
    stream.on(ev.ConnectError, (error) => this.logger.error(`ConnectError: ${error}`))
    stream.on(ev.Connected, () => this.logger.warn('Connected'))
    stream.on(ev.ConnectionLost, () => this.logger.error('ConnectionLost'))
    stream.on(ev.ConnectionClosed, () => this.logger.error('ConnectionClosed'))
    stream.on(ev.ConnectionClosed, () => this.onConnectionClosed())
    stream.on(ev.ReconnectError, (error) => this.logger.error(`ReconnectError: ${error}`))
    stream.on(ev.ReconnectAttempt, (tries) => this.logger.warn(`ReconnectAttempt: ${tries}`))
    stream.on(ev.ReconnectLimitExceeded, () => this.logger.error('ReconnectLimitExceeded'))
    stream.on(ev.Reconnected, () => this.logger.warn('Reconnected'))

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
      await Promise.allSettled(users.map((v) => this.twitterUserControllerService.saveUserV1(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async initStreamRules(retryCount = 0) {
    this.logger.debug('initStreamRules')
    try {
      const users = await this.twitterFilteredStreamUserService.getUsersForInitRules()
      const usernames = users
        // .map((v) => (v.username.length < v.id.length ? v.username : v.id))
        .map((v) => v.id)
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
      try {
        const tweets = data?.includes?.tweets || []
        const result = await Promise.allSettled(tweets.map((v) => this.twitterTweetControllerService.saveTweetV2(v)))
        const failedCount = result.filter((v) => v.status === 'rejected').length
        this.logger.debug('onData#saveTweetV2', { tweetCount: tweets.length, failedCount })
      } catch (error) {
        this.logger.error(`onData#saveTweetV2: ${error.message}`, data)
      }

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
            originTweetUrl,
            `${icon} ${hideLinkEmbed(tweetUrl)}`,
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
      items = items.filter((record) => {
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

  // #endregion
}
