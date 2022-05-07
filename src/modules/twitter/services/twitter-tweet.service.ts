import { hideLinkEmbed } from '@discordjs/builders'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ETwitterStreamEvent, TweetStream, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TwitterDiscordTweetService } from '../../database/services/twitter-discord-tweet.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterRuleUtils } from '../utils/TwitterRuleUtils'
import { TwitterUtils } from '../utils/TwitterUtils'
import { TwitterApiService } from './twitter-api.service'
import { TwitterClientService } from './twitter-client.service'

@Injectable()
export class TwitterTweetService {
  private readonly logger = baseLogger.child({ context: TwitterTweetService.name })

  private stream: TweetStream<TweetV2SingleStreamResult>;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterDiscordTweetService)
    private readonly twitterDiscordTweetService: TwitterDiscordTweetService,
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
    await this.connect()
    await this.initStreamRules()
  }

  public async connect(retryCount = 0) {
    try {
      this.logger.debug('Connecting')
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
    stream.on(ev.Connected, () => this.logger.info('Connected'))
    stream.on(ev.ConnectionClosed, () => this.logger.info('ConnectionClosed'))
    stream.on(ev.Reconnected, () => this.logger.info('Reconnected'))
    stream.on(ev.Data, (data) => this.onData(data))
  }

  private async initUsers() {
    try {
      const usernames = await this.twitterDiscordTweetService.getTwitterUsernames()
      const chunks = Utils.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => this.getUsers(v)))
    } catch (error) {
      this.logger.error(`initUsers: ${error.message}`)
    }
  }

  private async getUsers(usernames: string[], retryCount = 0) {
    if (!usernames?.length) {
      return
    }
    try {
      const users = await this.twitterApiService.getUsersByUsernames(usernames)
      if (!users.length) {
        const ms = ([10, 20][retryCount] || 30) * 1000
        this.logger.warn(`getUsers: Users not found, retry in ${ms}ms`, { usernameCount: usernames.length, usernames })
        await Utils.sleep(ms)
        this.getUsers(usernames, retryCount + 1)
        return
      }
      await Promise.allSettled(users.map((v) => this.twitterUserService.updateByTwitterUser(v)))
    } catch (error) {
      this.logger.error(`getUsers: ${error.message}`)
    }
  }

  private async initStreamRules(retryCount = 0) {
    try {
      const usernames = await this.twitterDiscordTweetService.getTwitterUsernames()
      const curStreamRules = (await this.client.v2.streamRules()).data || []
      const newStreamRules = TwitterRuleUtils.buildStreamRulesByUsernames(
        usernames,
        this.configService.twitterTweetRuleLength,
      )
      if (newStreamRules.length > this.configService.twitterTweetRuleLimit) {
        this.logger.error(`initStreamRules: Rule size (${newStreamRules.length}) exceed maximum limit (${this.configService.twitterTweetRuleLimit})`)
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
      this.connect(retryCount + 1)
    }
  }

  private onError(error) {
    this.logger.error(`Error: ${error.message}`)
  }

  private async onData(data: TweetV2SingleStreamResult) {
    try {
      const { author_id: authorId } = data.data
      const isAuthorExist = await this.twitterDiscordTweetService.existTwitterId(authorId)
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
      const records = await this.twitterDiscordTweetService.getManyByTwitterUsername(
        author.username,
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
