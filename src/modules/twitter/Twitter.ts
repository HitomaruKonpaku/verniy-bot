import { MessageOptions } from 'discord.js'
import Twit from 'twit'
import winston from 'winston'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { logger as baseLogger } from '../../logger'
import { TwitterUtil } from '../../utils/TwitterUtil'
import { Util } from '../../utils/Util'
import { configManager } from '../config/ConfigManager'
import { twitterDiscordProfileController } from '../database/controllers/TwitterDiscordProfileController'
import { twitterDiscordTweetController } from '../database/controllers/TwitterDiscordTweetController'
import { twitterUserController } from '../database/controllers/TwitterUserController'
import { discord } from '../discord/Discord'
import { TwitterProfileWatcher } from './TwitterProfileWatcher'
import { TwitterTweetWatcher } from './TwitterTweetWatcher'

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

  public async fetchUsers(usernames: string[]) {
    const { data } = await this.twit.post(
      'users/lookup',
      { screen_name: usernames.join(',') },
    )
    return data as Twit.Twitter.User[]
  }

  public async fetchUser(username: string) {
    const { data } = await this.twit.get(
      'users/show',
      { screen_name: username },
    )
    return data as Twit.Twitter.User
  }

  public getUser(id: string) {
    return this.users[id]
  }

  public updateUser(user: Twit.Twitter.User) {
    this.users[user.id_str] = user
    twitterUserController.update({
      id: user.id_str,
      createdAt: new Date(user.created_at),
      username: user.screen_name,
      name: user.name,
      profileImageUrl: user.profile_image_url_https?.replace?.('_normal', ''),
      profileBannerUrl: user.profile_banner_url,
    })
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
      this.logger.error(`initTwit: ${error.message}`)
    }
  }

  private async initWatchers() {
    this.logger.silly('initWatchers')
    if (!this.twit) {
      return
    }
    if (configManager.twitterTweetActive) {
      await this.watchTweet()
      this.logTweetCount()
    }
    if (configManager.twitterProfileActive) {
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
    const watcher = new TwitterProfileWatcher()
    watcher.on('profileUpdate', (newUser, oldUser) => this.onProfileUpdate(newUser, oldUser))
    watcher.watch()
  }

  private async initTwitterUsers() {
    this.logger.silly('initTwitterUsers')
    try {
      const usernames = await twitterDiscordTweetController.getTwitterUsernames()
      const usernameChunks = Util.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
      // eslint-disable-next-line max-len
      const userChunks = await Promise.all(usernameChunks.map((chunk) => this.fetchUsers(chunk))) as Twit.Twitter.User[][]
      userChunks.forEach((userChunk) => {
        userChunk.forEach((user) => {
          this.updateUser(user)
        })
      })
    } catch (error) {
      this.logger.error(`initTwitterUsers: ${error.message}`)
      setTimeout(() => this.initTwitterUsers(), 10000)
    }
  }

  private async onTweet(tweet: Twit.Twitter.Status) {
    // eslint-disable-next-line no-plusplus
    this.tweetCount++
    if (!this.getUser(tweet.user.id_str)) {
      return
    }

    const tweetUrl = TwitterUtil.getTweetUrl(tweet)
    this.logger.debug(`onTweet: ${tweetUrl}`)
    try {
      const channelIds = await this.getTweetReceiverChannelIds(tweet)
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
      this.logger.error(`onTweet: ${error.message}`)
    }
  }

  private async onProfileUpdate(newUser: Twit.Twitter.User, oldUser: Twit.Twitter.User) {
    this.logger.debug('onProfileUpdate')
    try {
      const channelIds = await this.getProfileReceiverChannelIds(oldUser)
      if (!channelIds.length) {
        return
      }

      const baseContent = `**@${newUser.screen_name}**`
      const messageOptionsList: MessageOptions[] = []

      if (newUser.profile_image_url_https !== oldUser.profile_image_url_https) {
        try {
          const newProfileImageUrl = newUser.profile_image_url_https.replace('_normal', '')
          const oldProfileImageUrl = oldUser.profile_image_url_https.replace('_normal', '')
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
        } catch (error) {
          this.logger.error(`onProfileUpdate#newProfileImage: ${error.message}`)
        }
      }

      if (newUser.profile_banner_url !== oldUser.profile_banner_url) {
        try {
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
        } catch (error) {
          this.logger.error(`onProfileUpdate#newProfileBanner: ${error.message}`)
        }
      }

      this.logger.info(`Channel ids: ${channelIds.join(',')}`)
      channelIds.forEach((channelId) => {
        messageOptionsList.forEach((messageOptions) => {
          discord.sendToChannel(channelId, messageOptions)
        })
      })
    } catch (error) {
      this.logger.error(`onProfileUpdate: ${error.message}`)
    }
  }

  private async getTweetReceiverChannelIds(tweet: Twit.Twitter.Status) {
    let channelIds = []
    try {
      const isReply = !!tweet.in_reply_to_screen_name
      const isRetweet = !!tweet.retweeted_status
      const records = await twitterDiscordTweetController.getByTwitterUsername(
        tweet.user.screen_name,
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
          const extendedTweet = (tweet as any).extended_tweet
          const entities = (extendedTweet || tweet).entities as Twit.Twitter.Entities
          const text = (extendedTweet?.full_text || tweet.text || '') as string
          const urls = entities?.urls?.map?.((v) => v?.expanded_url) || []
          const contents = [text, ...urls].filter((v) => v).map((v) => v.toLowerCase())
          // eslint-disable-next-line max-len
          const hasKeywords = record.filterKeywords.some((keyword) => contents.some((v) => v.includes(keyword.toLowerCase())))
          return hasKeywords
        })
        .map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getTweetReceiverChannelIds: ${error.message}`)
    }
    return channelIds
  }

  private async getProfileReceiverChannelIds(user: Twit.Twitter.User) {
    let channelIds = []
    try {
      const records = await twitterDiscordProfileController.getByTwitterUsername(user.screen_name)
      channelIds = records.map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getProfileReceiverChannelIds: ${error.message}`)
    }
    return channelIds
  }

  private logTweetCount() {
    this.logger.debug(`Found ${this.tweetCount} tweets`)
    setTimeout(() => this.logTweetCount(), this.TWEET_COUNT_LOG_INTERVAL)
  }
}

export const twitter = new Twitter()
