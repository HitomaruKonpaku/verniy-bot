import { MessageOptions } from 'discord.js'
import Twit from 'twit'
import winston from 'winston'
import { TwitterProfileWatcher } from '../classes/TwitterProfileWatcher'
import { TwitterTweetWatcher } from '../classes/TwitterTweetWatcher'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { logger as baseLogger } from '../logger'
import { TwitterUtil } from '../utils/TwitterUtil'
import { Util } from '../utils/Util'
import { discord } from './discord'

class Twitter {
  private readonly TWEET_COUNT_LOG_INTERVAL = 30E3

  private logger: winston.Logger
  private twit: Twit
  private users: Record<string, Twit.Twitter.User>

  private tweetCount = 0

  constructor() {
    this.logger = baseLogger.child({ label: '[Twitter]' })
    this.users = {}
  }

  public start() {
    this.logger.info('Starting...')
    this.initTwit()
    this.initWatchers()
  }

  public async getUsersLookup(usernames: string[]) {
    const { data } = await this.twit.post(
      'users/lookup',
      { screen_name: usernames.join(',') },
    )
    return data
  }

  public async getUsersShow(username: string) {
    const { data } = await this.twit.get(
      'users/show',
      { screen_name: username },
    )
    return data
  }

  public getUser(id: string) {
    return this.users[id]
  }

  public updateUser(user: Twit.Twitter.User) {
    this.users[user.id_str] = user
  }

  private initTwit() {
    this.logger.silly('initTwit')
    try {
      this.twit = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      })
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private async initWatchers() {
    this.logger.silly('initWatchers')
    if (!this.twit) {
      return
    }
    const config = TwitterUtil.getConfig()
    if (config?.tweet?.active) {
      await this.watchTweet()
      this.logTweetCount()
    }
    if (config?.profile?.active) {
      await this.watchProfile()
    }
  }

  private async watchTweet() {
    this.logger.silly('watchTweet')
    await this.initTwitterUsers()
    const users = Object.values(this.users)
    const watcher = new TwitterTweetWatcher(this.twit)
    watcher.on('tweet', (tweet) => this.onTweet(tweet))
    watcher.watch(users)
  }

  private async watchProfile() {
    this.logger.silly('watchProfile')
    const config = TwitterUtil.getProfileConfig()
    const users = config?.users || []
    const watcher = new TwitterProfileWatcher()
    watcher.on('profileUpdate', (newUser, oldUser) => this.onProfileUpdate(newUser, oldUser))
    watcher.watch(users)
  }

  private async initTwitterUsers() {
    this.logger.silly('initTwitterUsers')
    try {
      const config = TwitterUtil.getTweetConfig()
      const usernameSet = Array.from(config?.follows || [])
        .reduce((pv: Set<string>, cv: any) => {
          Array.from(cv?.users || []).forEach((v: string) => pv.add(v))
          return pv
        }, new Set<string>()) as Set<string>
      const usernameChunks = Util.splitArrayIntoChunk([...usernameSet], TWITTER_API_LIST_SIZE)
      // eslint-disable-next-line max-len
      const userChunks = await Promise.all(usernameChunks.map((chunk) => this.getUsersLookup(chunk))) as Twit.Twitter.User[][]
      userChunks.forEach((userChunk) => {
        userChunk.forEach((user) => {
          this.updateUser(user)
        })
      })
    } catch (error) {
      this.logger.error(error.message)
      await this.initTwitterUsers()
    }
  }

  private onTweet(tweet: Twit.Twitter.Status) {
    // eslint-disable-next-line no-plusplus
    this.tweetCount++
    if (!this.getUser(tweet.user.id_str)) {
      return
    }

    const tweetUrl = TwitterUtil.getTweetUrl(tweet)
    this.logger.debug(`onTweet: ${tweetUrl}`)
    try {
      const channelIds = this.getTweetReceiverChannelIds(tweet)
      if (!channelIds.length) {
        return
      }
      this.logger.info(`Tweet: ${tweetUrl}`)
      const contentList = [tweetUrl]
      if (tweet.in_reply_to_screen_name) {
        const inReplyToTweetUrl = TwitterUtil.getInReplyToTweetUrl(tweet)
        this.logger.info(`InReplyToTweet: ${inReplyToTweetUrl}`)
        contentList.push(` in reply to ${inReplyToTweetUrl}`)
      }
      const content = contentList.filter((v) => v).join('').trim()
      this.logger.debug(`Channel ids: ${channelIds.join(',')}`)
      channelIds.forEach((channelId) => {
        discord.sendToChannel(channelId, { content })
      })
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private getTweetReceiverChannelIds(tweet: Twit.Twitter.Status) {
    const channelIds = []
    try {
      const config = TwitterUtil.getTweetConfig()
      config.follows
        ?.filter((v) => v.users?.includes(tweet.user.screen_name))
        ?.forEach((follow) => follow.channels?.forEach((channel) => {
          // eslint-disable-next-line no-nested-ternary
          const isSkipReply = channel.skipReply !== undefined
            ? !!channel.skipReply
            : follow.skipReply !== undefined
              ? !!follow.skipReply
              : false
          // eslint-disable-next-line max-len
          if (isSkipReply && tweet.in_reply_to_screen_name && tweet.in_reply_to_screen_name !== tweet.user.screen_name) {
            return
          }
          // eslint-disable-next-line no-nested-ternary
          const isSkipRetweet = channel.skipRetweet !== undefined
            ? !!channel.skipRetweet
            : follow.skipRetweet !== undefined
              ? !!follow.skipRetweet
              : false
          if (isSkipRetweet && tweet.retweeted_status) {
            return
          }
          if (follow.filters?.length) {
            const extendedTweet = (tweet as any).extended_tweet
            const text = (extendedTweet?.full_text || tweet.text) as string
            const entities = (extendedTweet || tweet).entities as Twit.Twitter.Entities
            const isMatch = follow.filters.some((filter) => {
              if (!filter || typeof filter !== 'object' || Array.isArray(filter) || !Object.keys(filter).length) {
                return true
              }
              const checks = [
                filter.keywords?.length
                  ? filter.keywords.some((keyword: string) => text.includes(keyword))
                  : true,
                filter.urls?.length
                  // eslint-disable-next-line max-len
                  ? filter.urls.some((url: string) => entities.urls.some((v) => v.expanded_url.includes(url)))
                  : true,
              ]
              return checks.every((v) => v)
            })
            if (!isMatch) {
              return
            }
          }
          channelIds.push(channel.id)
        }))
      return channelIds
    } catch (error) {
      this.logger.error(error.message)
    }
    return channelIds
  }

  private onProfileUpdate(newUser: Twit.Twitter.User, oldUser: Twit.Twitter.User) {
    this.logger.debug('onProfileUpdate')
    try {
      const config = TwitterUtil.getProfileConfig()
      const channelIds = [
        ...new Set(config.follows
          .filter((v) => v.users?.includes(newUser.screen_name))
          .flatMap((v) => v.channels)
          .map((v) => v.id))
      ] as string[]
      if (!channelIds.length) {
        return
      }

      const baseContent = `**@${newUser.screen_name}**`
      const messageOptionsList: MessageOptions[] = []

      if (newUser.profile_image_url_https !== oldUser.profile_image_url_https) {
        const newProfileImageUrl = newUser.profile_image_url_https
          .replace('_normal', '')
        const oldProfileImageUrl = oldUser.profile_image_url_https
          .replace('_normal', '')
        this.logger.info(`Old profile image: ${oldProfileImageUrl}`)
        this.logger.info(`New profile image: ${newProfileImageUrl}`)
        messageOptionsList.push({
          content: [
            baseContent,
            `Old profile image: <${oldProfileImageUrl}>`,
            `New profile image: <${newProfileImageUrl}>`,
          ].join('\n'),
          files: [newProfileImageUrl],
        })
      }

      if (newUser.profile_banner_url !== oldUser.profile_banner_url) {
        this.logger.info(`Old profile banner: ${oldUser.profile_banner_url}`)
        this.logger.info(`New profile banner: ${newUser.profile_banner_url}`)
        const fileName = `${new URL(newUser.profile_banner_url).pathname.split('/').reverse()[0]}.jpg`
        messageOptionsList.push({
          content: [
            baseContent,
            `Old profile banner: <${oldUser.profile_banner_url}>`,
            `New profile banner: <${newUser.profile_banner_url}>`,
          ].join('\n'),
          files: [{
            attachment: newUser.profile_banner_url,
            name: fileName,
          }],
        })
      }

      this.logger.info(`Channel ids: ${channelIds.join(',')}`)
      channelIds.forEach((channelId) => {
        messageOptionsList.forEach((messageOptions) => {
          discord.sendToChannel(channelId, messageOptions)
        })
      })
    } catch (error) {
      this.logger.error(error.message)
    }
  }

  private logTweetCount() {
    this.logger.debug(`Found ${this.tweetCount} tweets`)
    setTimeout(() => this.logTweetCount(), this.TWEET_COUNT_LOG_INTERVAL)
  }
}

export const twitter = new Twitter()
