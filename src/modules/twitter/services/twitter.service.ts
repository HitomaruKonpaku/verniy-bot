import { bold, hideLinkEmbed, inlineCode } from '@discordjs/builders'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { MessageOptions } from 'discord.js'
import Twit from 'twit'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TwitterUser } from '../../database/models/twitter-user'
import { TwitterDiscordProfileService } from '../../database/services/twitter-discord-profile.service'
import { TwitterDiscordTweetService } from '../../database/services/twitter-discord-tweet.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterUtils } from '../utils/TwitterUtils'
import { TwitterProfileWatcher } from '../watchers/twitter-profile-watcher'
import { TwitterTweetWatcher } from '../watchers/twitter-tweet-watcher'

@Injectable()
export class TwitterService {
  private readonly logger = baseLogger.child({ context: TwitterService.name })

  private twit: Twit
  private tweetWatcher: TwitterTweetWatcher
  private profileWatcher: TwitterProfileWatcher

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterDiscordTweetService)
    private readonly twitterDiscordTweetService: TwitterDiscordTweetService,
    @Inject(TwitterDiscordProfileService)
    private readonly twitterDiscordProfileService: TwitterDiscordProfileService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.initTwit()
  }

  public async start() {
    this.logger.info('Starting...')
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

  private initTwit() {
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
    if (!this.twit) {
      this.logger.warn('twit not found')
      return
    }
    if (this.configService.twitterTweetActive) {
      await this.watchTweet()
    }
    if (this.configService.twitterProfileActive) {
      await this.watchProfile()
    }
  }

  private async initTwitterUsers() {
    try {
      const usernames = await this.twitterDiscordTweetService.getTwitterUsernames()
      const usernameChunks = Utils.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
      // eslint-disable-next-line max-len
      const userChunks = await Promise.all(usernameChunks.map((chunk) => this.fetchUsers(chunk))) as Twit.Twitter.User[][]
      const users = userChunks.flat()
      await Promise.all(users.map((v) => this.twitterUserService.updateByTwitterUser(v)))
    } catch (error) {
      this.logger.error(`initTwitterUsers: ${error.message}`)
    }
  }

  private async watchTweet() {
    await this.initTwitterUsers()
    const watcher = new TwitterTweetWatcher(
      this.twit,
      this.twitterUserService,
    )
    this.tweetWatcher = watcher
    watcher.on('tweet', (tweet) => this.onTweet(tweet))
    watcher.start()
  }

  private async watchProfile() {
    const watcher = new TwitterProfileWatcher(
      this.configService,
      this,
      this.twitterUserService,
      this.twitterDiscordProfileService,
    )
    this.profileWatcher = watcher
    watcher.on('profileUpdate', (newUser, oldUser) => this.onProfileUpdate(newUser, oldUser))
    watcher.start()
  }

  private async onTweet(tweet: Twit.Twitter.Status) {
    // eslint-disable-next-line max-len
    const isAuthorExist = await this.twitterDiscordTweetService.existTwitterUsername(tweet.user.screen_name)
    if (!isAuthorExist) {
      return
    }

    const tweetUrl = TwitterUtils.getTweetUrl(tweet)
    this.logger.debug(`onTweet: ${tweetUrl}`)

    try {
      const channelIds = await this.getTweetReceiverChannelIds(tweet)
      if (!channelIds.length) {
        return
      }

      this.logger.info(`Tweet: ${tweetUrl}`)
      let content: string = tweetUrl
      if (tweet.in_reply_to_screen_name && tweet.in_reply_to_status_id_str) {
        const mainTweetUrl = TwitterUtils.getInReplyToTweetUrl(tweet)
        content = [
          tweetUrl,
          `💬 ${mainTweetUrl}`,
        ].join('\n')
      } else if (tweet.retweeted_status) {
        const mainTweetUrl = TwitterUtils.getTweetUrl(tweet.retweeted_status)
        content = [
          hideLinkEmbed(tweetUrl),
          `🔁 ${mainTweetUrl}`,
        ].join('\n')
      }

      this.logger.debug(`Channel ids: ${channelIds.join(',')}`)
      channelIds.forEach((channelId) => {
        this.discordService.sendToChannel(channelId, { content })
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

      const baseContent = bold(inlineCode(`@${newUser.username}`))
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
          this.discordService.sendToChannel(channelId, messageOptions)
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
      const records = await this.twitterDiscordTweetService.getManyByTwitterUsername(
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
      // eslint-disable-next-line max-len
      const records = await this.twitterDiscordProfileService.getManyByTwitterUsername(user.username)
      channelIds = records.map((v) => v.discordChannelId)
    } catch (error) {
      this.logger.error(`getProfileReceiverChannelIds: ${error.message}`)
    }
    return channelIds
  }
}
