import { bold, hideLinkEmbed, inlineCode } from '@discordjs/builders'
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
import { TwitterUser } from '../database/models/TwitterUser'
import { discord } from '../discord/Discord'
import { TwitterProfileWatcher } from './TwitterProfileWatcher'
import { TwitterTweetWatcher } from './TwitterTweetWatcher'

class Twitter {
  private logger: winston.Logger
  private twit: Twit

  constructor() {
    this.logger = baseLogger.child({ label: '[Twitter]' })
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

  // eslint-disable-next-line class-methods-use-this
  public async getUser(id: string) {
    const twitterUser = await twitterUserController.getOneById(id)
    return twitterUser
  }

  // eslint-disable-next-line class-methods-use-this
  public async updateUser(user: Twit.Twitter.User) {
    const twitterUser = await twitterUserController.update({
      id: user.id_str,
      createdAt: new Date(user.created_at),
      username: user.screen_name,
      name: user.name,
      location: user.location,
      description: user.description,
      protected: user.protected,
      verified: user.verified,
      profileImageUrl: user.profile_image_url_https?.replace?.('_normal', ''),
      profileBannerUrl: user.profile_banner_url,
    })
    return twitterUser
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
    }
    if (configManager.twitterProfileActive) {
      await this.watchProfile()
    }
  }

  private async watchTweet() {
    this.logger.silly('watchTweet')
    await this.initTwitterUsers()
    const watcher = new TwitterTweetWatcher(this.twit)
    watcher.on('tweet', (tweet) => this.onTweet(tweet))
    watcher.watch()
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
      const usernames = await twitterDiscordTweetController.getAllTwitterUsernames()
      const usernameChunks = Util.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
      // eslint-disable-next-line max-len
      const userChunks = await Promise.all(usernameChunks.map((chunk) => this.fetchUsers(chunk))) as Twit.Twitter.User[][]
      const users = userChunks.flat()
      await Promise.all(users.map((v) => this.updateUser(v)))
    } catch (error) {
      this.logger.error(`initTwitterUsers: ${error.message}`)
      setTimeout(() => this.initTwitterUsers(), 10000)
    }
  }

  private async onTweet(tweet: Twit.Twitter.Status) {
    // eslint-disable-next-line max-len
    const isAuthorExist = await twitterDiscordTweetController.existTwitterUsername(tweet.user.screen_name)
    if (!isAuthorExist) {
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

  private async onProfileUpdate(newUser: TwitterUser, oldUser: TwitterUser) {
    this.logger.debug('onProfileUpdate', { newUser, oldUser })
    try {
      const channelIds = await this.getProfileReceiverChannelIds(oldUser)
      if (!channelIds.length) {
        return
      }

      const baseContent = bold(`@${newUser.username}`)
      const messageOptionsList: MessageOptions[] = []

      if (newUser.name !== oldUser.name) {
        try {
          this.logger.info(`${newUser.username} name`, { to: newUser.name, from: oldUser.name })
          messageOptionsList.push({
            content: [
              `${baseContent}'s name changed`,
              `❌ ${inlineCode(oldUser.name)}`,
              `➡️ ${inlineCode(newUser.name)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#name: ${error.message}`)
        }
      }

      if (newUser.location !== oldUser.location) {
        try {
          this.logger.info(`${newUser.username} location`, { to: newUser.location, from: oldUser.location })
          messageOptionsList.push({
            content: [
              `${baseContent}'s location changed`,
              `❌ ${inlineCode(oldUser.location)}`,
              `➡️ ${inlineCode(newUser.location)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#location: ${error.message}`)
        }
      }

      if (newUser.description !== oldUser.description) {
        try {
          this.logger.info(`${newUser.username} description`, { to: newUser.description, from: oldUser.description })
          messageOptionsList.push({
            content: [
              `${baseContent}'s description changed`,
              `❌ ${inlineCode(oldUser.description)}`,
              `➡️ ${inlineCode(newUser.description)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#description: ${error.message}`)
        }
      }

      if (newUser.protected !== oldUser.protected) {
        try {
          this.logger.info(`${newUser.username} protected: ${newUser.protected ? '✅' : '❌'}`)
          messageOptionsList.push({
            content: [
              baseContent,
              `Protected: ${newUser.protected ? '✅' : '❌'}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#protected: ${error.message}`)
        }
      }

      if (newUser.verified !== oldUser.verified) {
        try {
          this.logger.info(`${newUser.username} verified: ${newUser.verified ? '✅' : '❌'}`)
          messageOptionsList.push({
            content: [
              baseContent,
              `Verified: ${newUser.verified ? '✅' : '❌'}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#verified: ${error.message}`)
        }
      }

      if (newUser.profileImageUrl !== oldUser.profileImageUrl) {
        try {
          const newProfileImageUrl = newUser.profileImageUrl
          const oldProfileImageUrl = oldUser.profileImageUrl
          this.logger.info(`${newUser.username} profile image`, { to: newProfileImageUrl, from: oldProfileImageUrl })
          messageOptionsList.push({
            content: [
              `${baseContent}'s profile image changed`,
              `❌ ${hideLinkEmbed(oldUser.profileImageUrl)}`,
              `➡️ ${hideLinkEmbed(newUser.profileImageUrl)}`,
            ].join('\n'),
            files: [newProfileImageUrl],
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#profileImageUrl: ${error.message}`)
        }
      }

      if (newUser.profileBannerUrl !== oldUser.profileBannerUrl) {
        try {
          this.logger.info(`${newUser.username} profile banner`, { to: newUser.profileBannerUrl, from: oldUser.profileBannerUrl })
          const fileName = newUser.profileBannerUrl
            ? `${new URL(newUser.profileBannerUrl).pathname.split('/').reverse()[0]}.jpg`
            : null
          messageOptionsList.push({
            content: [
              `${baseContent}'s profile banner changed`,
              `❌ ${hideLinkEmbed(oldUser.profileBannerUrl)}`,
              `➡️ ${hideLinkEmbed(newUser.profileBannerUrl)}`,
            ].join('\n'),
            files: newUser.profileBannerUrl
              ? [{ attachment: newUser.profileBannerUrl, name: fileName }]
              : null,
          })
        } catch (error) {
          this.logger.error(`onProfileUpdate#profileBannerUrl: ${error.message}`)
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
      const records = await twitterDiscordTweetController.getManyByTwitterUsername(
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

  private async getProfileReceiverChannelIds(user: TwitterUser) {
    let channelIds = []
    try {
      const records = await twitterDiscordProfileController.getByTwitterUsername(user.username)
      channelIds = records.map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getProfileReceiverChannelIds: ${error.message}`)
    }
    return channelIds
  }
}

export const twitter = new Twitter()
