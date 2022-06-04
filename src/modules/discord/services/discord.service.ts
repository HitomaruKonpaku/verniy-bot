import { forwardRef, Inject, Injectable } from '@nestjs/common'
import {
  Channel,
  MessageOptions,
  MessagePayload,
  TextChannel,
} from 'discord.js'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { HolodexService } from '../../holodex/services/holodex.service'
import { InstagramService } from '../../instagram/services/instagram.service'
import { TwitCastingService } from '../../twitcasting/services/twitcasting.service'
import { TwitchService } from '../../twitch/services/twitch.service'
import { TwitterService } from '../../twitter/services/twitter.service'
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
    private readonly discordDbService: DiscordDbService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService,
    @Inject(forwardRef(() => TwitCastingService))
    private readonly twitCastingService: TwitCastingService,
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService,
    @Inject(forwardRef(() => InstagramService))
    private readonly instagramService: InstagramService,
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
      if (channel instanceof TextChannel) {
        this.logger.debug('getChannel: TextChannel', { id, name: channel.name })
      } else {
        this.logger.debug('getChannel: Channel', { id })
      }
      return channel
    } catch (error) {
      this.logger.error(`getChannel: ${error.message}`, { id })
      return null
    }
  }

  public async sendToChannel(channelId: string, options: string | MessagePayload | MessageOptions) {
    try {
      const channel = await this.getChannel<TextChannel>(channelId)
      if (!channel) return null
      this.discordDbService.saveTextChannel(channel)
      const guild = channel.guildId
        ? await this.getGuild(channel.guildId)
        : null
      if (guild) {
        this.discordDbService.saveGuild(guild)
      }
      const message = await channel.send(options)
      this.logger.info(`Message was sent to ${guild.name ? `[${guild.name}]` : ''}[#${channel.name}] (${channelId})`)
      this.discordDbService.saveMessage(message)
      return message
    } catch (error) {
      this.logger.error(`sendToChannel: ${error.message}`, { channelId })
    }
    return null
  }

  private addClientListeners() {
    const { client } = this

    client.once('ready', async () => {
      this.client.guilds.cache.forEach((guild) => {
        this.discordDbService.saveGuild(guild)
      })

      const channelIds = await this.twitterService.getDiscordChannelIds()
      this.client.channels.cache.forEach((channel) => {
        if (channelIds.includes(channel.id) && channel instanceof TextChannel) {
          this.discordDbService.saveTextChannel(channel)
        }
      })
    })

    client.once('ready', () => {
      if (this.configService.twitter.active) {
        this.twitterService.start()
      }
      if (this.configService.twitcasting.active) {
        this.twitCastingService.start()
      }
      if (this.configService.twitch.active) {
        this.twitchService.start()
      }
      if (this.configService.instagram.active) {
        this.instagramService.start()
      }
      if (this.configService.holodex.active) {
        this.holodexService.start()
      }
    })
  }
}
