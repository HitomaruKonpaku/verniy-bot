import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Client, Guild, Message, TextChannel } from 'discord.js'
import * as Twit from 'twit'
import { EnvironmentService } from '../../environment/services/environment.service'
import { TwitterEventConstants } from '../../twitter/constants/twitter-event.constants'
import { TwitterService } from '../../twitter/services/twitter.service'
import { DiscordService } from './discord.service'

@Injectable()
export class DiscordEventService {
  private readonly _logger = new Logger(DiscordEventService.name)

  private get client(): Client {
    return this.discordService.client
  }

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    private readonly twitterService: TwitterService,
  ) { }

  public attachEvents() {
    this.client
      .on('debug', info => this.onDebug(info))
      .on('warn', info => this.onWarn(info))
      .on('error', error => this.onError(error))
      .on('ready', () => this.onReady())
      .once('ready', () => this.onceReady())
      .on('message', message => this.onMessage(message))
      .on('guildUnavailable', guild => this.onGuildUnavailable(guild))
      .on('guildCreate', guild => this.onGuildCreate(guild))
      .on('guildDelete', guild => this.onGuildDelete(guild))
  }

  private onDebug(info: string) {
    const skipMessages = [
      'Authenticated using token',
      'Sending a heartbeat',
      'Heartbeat acknowledged',
      'READY',
    ]
    if (skipMessages.some(v => info.includes(v))) {
      return
    }
    this._logger.debug(info)
  }

  private onWarn(info: string) {
    this._logger.warn(info)
  }

  private onError(error: Error) {
    this._logger.error(error.message)
  }

  private onReady() {
    const msg = `${this.client.user.tag} ready!`
    this._logger.log(msg)
  }

  private onceReady() {
    process.once('SIGTERM', async () => {
      await this.sendLogFile()
    })

    this.twitterService.on(TwitterEventConstants.TWEET, (tweet, config) => {
      this.onTwitterTweet(tweet, config)
    })
    this.twitterService.on(TwitterEventConstants.PROFILE_IMAGE_CHANGED, (user: Twit.Twitter.User, config) => {
      this.onTwitterUserProfileImageChanged(user, config)
    })
    //
    this.twitterService.start()
  }

  private async onMessage(message: Message) {
    if (message.author.id === '153363129915539457') {
      if (message.content.trim() === '.log') {
        await this.sendLogFile()
      }
    }

    if (!this.environmentService.isDev) {
      return
    }

    const guild = message.guild
    const channel = message.channel as TextChannel
    const author = message.author
    const content = message.cleanContent

    const ignoreAuthorIds = ['742677218471313488']
    if (author.bot || ignoreAuthorIds.some(id => id === author.id)) {
      return
    }

    const msg = [
      [
        guild.name,
        channel.name,
        author.tag,

      ].map(v => `[${v}]`).join(''),
      ` > ${content}`,
    ].join('')
    this._logger.log(msg)
  }

  private onGuildUnavailable(guild: Guild) {
    const msg = `[Guild] Unavailable: ${guild.name}`
    this._logger.warn(msg)
  }

  private onGuildCreate(guild: Guild) {
    const msg = `[Guild] Joined: ${guild.name}`
    this._logger.log(msg)
  }

  private onGuildDelete(guild: Guild) {
    const msg = `[Guild] Leave: ${guild.name}`
    this._logger.log(msg)
  }

  private async sendLogFile() {
    const id = '550253945985957898'
    const channel = await this.client.channels.fetch(id) as TextChannel
    const time = new Date()
      .toISOString()
      .split(/[TZ\-:.]/g)
      .filter((v, i) => i < 6)
      .map(v => v.padStart(2, '0'))
      .join('_')
    const name = `log_${time}.txt`
    const logs = this._logger['getInstance']()['logs'] as string[]
    const content = logs.join('\n')
    const file = {
      name,
      attachment: Buffer.from(content, 'utf8'),
    }
    await channel.send({ files: [file] })
  }

  //#region Twitter events

  private onTwitterTweet(tweet: Twit.Twitter.Status, config) {
    function getTweetMediaObject(tweet) {
      function getRoot(tweet) {
        if (tweet.retweeted_status) {
          return tweet.retweeted_status.extended_tweet || tweet.retweeted_status
        }
        if (tweet.quoted_status) {
          return tweet.quoted_status.extended_tweet || tweet.quoted_status
        }
        return tweet.extended_tweet || tweet
      }

      const root = getRoot(tweet)
      const media = root.entities.media
      return media
    }

    // Tweet author
    const uid = tweet.user.id_str
    if (!Object.keys(config).includes(uid)) {
      return
    }
    // Which channels to send?
    const channelIds = []
    Object.keys(config[uid]).forEach(cid => {
      const channel = config[uid][cid]
      // Check reply exist, allow self reply
      if (channel.reply !== undefined) {
        if (channel.reply !== !!tweet.in_reply_to_screen_name && tweet.in_reply_to_screen_name !== tweet.user.screen_name) {
          return
        }
      }
      // Check retweet
      if (channel.retweet !== undefined) {
        if (channel.retweet !== !!tweet.retweeted_status) {
          return
        }
      }
      // Check media
      if (channel.media !== undefined) {
        const media = getTweetMediaObject(tweet)
        if (channel.media !== !!media) {
          return
        }
      }
      // Add channel
      channelIds.push(cid)
    })

    if (!channelIds.length) {
      return
    }

    // Send
    const user = tweet.user
    const url = `https://twitter.com/${user.screen_name}/status/${tweet.id_str}`
    this._logger.log(`Tweet: ${url}`)
    const content = [
      `**@${user.screen_name}**`,
      url,
    ].join('\n')
    this.discordService.sendChannels(channelIds, { content })
  }

  private onTwitterUserProfileImageChanged(user: Twit.Twitter.User, config) {
    const channelIds = config.channels
    const content = `**@${user.screen_name}**`
    const imageUrl = user.profile_image_url_https.replace('_normal', '')
    this.discordService.sendChannels(channelIds, {
      content,
      files: [imageUrl],
    })
  }

  //#endregion
}
