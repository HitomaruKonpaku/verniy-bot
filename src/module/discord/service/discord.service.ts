import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Channel, ChannelType, DMChannel, Guild, MessageCreateOptions, MessagePayload, StageChannel, TextChannel, User, VoiceChannel } from 'discord.js'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { HolodexService } from '../../holodex/service/holodex.service'
import { InstagramService } from '../../instagram/service/instagram.service'
import { TiktokService } from '../../tiktok/service/tiktok.service'
import { TrackService } from '../../track/service/track.service'
import { TwitCastingService } from '../../twitcasting/service/twitcasting.service'
import { TwitchService } from '../../twitch/service/twitch.service'
import { TwitterService } from '../../twitter/service/twitter.service'
import { YoutubeService } from '../../youtube/service/youtube.service'
import { DiscordClientService } from './discord-client.service'
import { DiscordDbService } from './discord-db.service'

@Injectable()
export class DiscordService {
  private readonly logger = baseLogger.child({ context: DiscordService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(DiscordClientService)
    private readonly client: DiscordClientService,
    @Inject(DiscordDbService)
    private readonly db: DiscordDbService,
    @Inject(TrackService)
    private readonly trackService: TrackService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService,
    @Inject(forwardRef(() => TwitCastingService))
    private readonly twitCastingService: TwitCastingService,
    @Inject(forwardRef(() => YoutubeService))
    private readonly youtubeService: YoutubeService,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => InstagramService))
    private readonly instagramService: InstagramService,
    @Inject(forwardRef(() => TiktokService))
    private readonly tiktokService: TiktokService,
    @Inject(forwardRef(() => HolodexService))
    private readonly holodexService: HolodexService,
  ) {
    this.addClientListeners()
  }

  public async start() {
    this.logger.info('Starting...')
    try {
      const token = process.env.DISCORD_TOKEN
      if (!token) {
        this.logger.error('DISCORD_TOKEN not found')
      }
      await this.client.login(token)
      this.logger.warn('Logged in!')
    } catch (error) {
      this.logger.error(`start: ${error.message}`)
    }
  }

  public async getOwner() {
    let owner: User = this.client.application.owner as User
    if (!owner) {
      await this.client.application.fetch()
      owner = this.client.application.owner as User
    }
    return owner
  }

  public async getGuild(id: string) {
    try {
      const guild = await this.client.guilds.fetch(id)
      this.logger.debug('getGuild', { id, name: guild.name })
      return guild
    } catch (error) {
      this.logger.error(`getGuild: ${error.message}`, { id })
      return null
    }
  }

  public async getChannel<T extends Channel>(id: string) {
    try {
      const channel = await this.client.channels.fetch(id) as any as T
      const meta = {
        id,
        isDMBased: channel.isDMBased(),
        isTextBased: channel.isTextBased(),
        isThread: channel.isThread(),
        isVoiceBased: channel.isVoiceBased(),
      }

      if (channel.type === ChannelType.GuildText) {
        this.logger.debug('getChannel: GuildText', { id, name: channel.name, ...meta })
      } else {
        this.logger.debug('getChannel: Channel', meta)
      }

      return channel
    } catch (error) {
      this.logger.error(`getChannel: ${error.message}`, { id })

      if (error.status === 404 && error.code === 10003) {
        await this.trackService.deactivateByChannelId(id)
          .then(() => this.logger.debug('deactivateByChannelId', { id }))
          .catch((err) => this.logger.error(`deactivateByChannelId: ${err.message}`, { id }))
      }

      return null
    }
  }

  public async sendToChannel(
    channelId: string,
    options: string | MessagePayload | MessageCreateOptions,
    config?: { throwError?: boolean },
  ) {
    try {
      // Get channel
      const channel = await this.getChannel<Channel>(channelId)
      const canSend = channel
        && channel.isTextBased()
        && !(channel instanceof VoiceChannel || channel instanceof StageChannel)
      if (!canSend) {
        return null
      }

      let guild: Guild
      if (channel instanceof TextChannel) {
        // Try to save destination channel & guild
        this.db.saveTextChannel(channel)
        guild = channel.guildId
          ? await this.getGuild(channel.guildId)
          : null
        if (guild) {
          this.db.saveGuild(guild)
        }
      }

      // Send message
      const message = await channel.send(options)
      if (message) {
        if (channel instanceof TextChannel) {
          this.logger.debug(`Message was sent to ${guild.name ? `[${guild.name}]` : ''}[#${channel.name}] (${channelId})`)
        } else if (channel instanceof DMChannel) {
          this.logger.debug(`Message was sent to ${channel.recipient.tag}`)
        } else {
          this.logger.debug(`Message was sent to ${channel.toString()}`)
        }

        // this.discordDbService.saveMessage(message)

        // Crosspost message
        // if (message.channel.type === ChannelType.GuildAnnouncement) {
        //   await message.crosspost()
        //     .then(() => this.logger.debug('Crossposted message!'))
        //     .catch((error) => this.logger.error(`sendToChannel#crosspost: ${error.message}`, { channelId, messageId: message.id }))
        // }
      }

      // Return message
      return message
    } catch (error) {
      this.logger.error(`sendToChannel: ${error.message}`, { channelId })
      if (config?.throwError) {
        throw error
      }
    }

    return null
  }

  private addClientListeners() {
    const { client } = this

    client.once('ready', () => {
      this.saveClientGuilds()
      this.saveClientChannels()
    })

    client.once('ready', () => {
      this.startServices()
    })
  }

  private async saveClientGuilds() {
    this.client.guilds.cache.forEach((guild) => {
      this.db.saveGuild(guild)
    })
  }

  private async saveClientChannels() {
    try {
      const channelIds = []
      this.client.channels.cache.forEach((channel) => {
        if (channelIds.includes(channel.id) && channel instanceof TextChannel) {
          this.db.saveTextChannel(channel)
        }
      })
    } catch (error) {
      this.logger.error(`saveClientChannels: ${error.message}`)
    }
  }

  private startServices() {
    if (this.configService.twitter.active) {
      this.twitterService.start()
    }
    if (this.configService.twitcasting.active) {
      this.twitCastingService.start()
    }
    if (this.configService.youtube.active) {
      this.youtubeService.start()
    }
    if (this.configService.twitch.active) {
      this.twitchService.start()
    }
    if (this.configService.instagram.active) {
      this.instagramService.start()
    }
    if (this.configService.tiktok.active) {
      this.tiktokService.start()
    }
    if (this.configService.holodex.active) {
      this.holodexService.start()
    }
  }
}
