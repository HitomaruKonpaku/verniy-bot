import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  Channel,
  Client,
  Collection,
  CommandInteraction,
  Guild,
  Interaction,
  Message,
  MessageOptions,
  MessagePayload,
  TextChannel,
  User,
} from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TrackTwitterProfileService } from '../../track/services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from '../../track/services/track-twitter-space.service'
import { TrackTwitterTweetService } from '../../track/services/track-twitter-tweet.service'
import { TwitCastingService } from '../../twitcasting/services/twitcasting.service'
import { TwitterService } from '../../twitter/services/twitter.service'
import { DISCORD_APP_COMMANDS } from '../constants/discord-command.constant'
import { DISCORD_CLIENT_OPTIONS } from '../constants/discord.constant'
import { DiscordChannelService } from './discord-channel.service'
import { DiscordGuildService } from './discord-guild.service'
import { DiscordMessageService } from './discord-message.service'
import { DiscordUserService } from './discord-user.service'

@Injectable()
export class DiscordService {
  private readonly logger = baseLogger.child({ context: DiscordService.name })

  private client: Client
  public commands = new Collection<string, any>()

  constructor(
    @Inject(ModuleRef)
    private moduleRef: ModuleRef,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(DiscordUserService)
    private readonly discordUserService: DiscordUserService,
    @Inject(DiscordGuildService)
    private readonly discordGuildService: DiscordGuildService,
    @Inject(DiscordChannelService)
    private readonly discordChannelService: DiscordChannelService,
    @Inject(DiscordMessageService)
    private readonly discordMessageService: DiscordMessageService,
    @Inject(forwardRef(() => TrackTwitterTweetService))
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(forwardRef(() => TrackTwitterProfileService))
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
    @Inject(forwardRef(() => TrackTwitterSpaceService))
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService,
    @Inject(forwardRef(() => TwitCastingService))
    private readonly twitCastingService: TwitCastingService,
  ) {
    this.initClient()
  }

  public async start() {
    this.logger.info('Starting...')
    try {
      const token = process.env.DISCORD_TOKEN
      if (!token) {
        this.logger.error('DISCORD_TOKEN not found')
      }
      await this.client.login(token)
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
      const guild = channel.guildId
        ? await this.getGuild(channel.guildId)
        : null
      this.saveDiscordChannelData(channel)
      const message = await channel.send(options)
      this.logger.info(`Message was sent to ${guild.name ? `[${guild.name}]` : ''}[#${channel.name}] (${channelId})`)
      this.saveMessage(message).catch()
      return message
    } catch (error) {
      this.logger.error(`sendToChannel: ${error.message}`, { channelId })
    }
    return null
  }

  private initClient() {
    this.client = new Client(DISCORD_CLIENT_OPTIONS)
    this.initCommands()
    this.addClientEventListeners()
  }

  private initCommands() {
    const commands = DISCORD_APP_COMMANDS
    commands.forEach((v) => this.commands.set(v.command.name, v))
  }

  private addClientEventListeners() {
    const { client } = this
    client.on('error', (error) => {
      this.logger.error(error.message)
    })
    client.on('warn', (message) => {
      this.logger.warn(message)
    })
    client.on('debug', (message) => {
      this.logger.debug(message)
    })
    client.on('shardError', (error, shardId) => {
      this.logger.error(`[Shard ${shardId}] ${error.message}`)
    })
    client.on('shardReady', (shardId) => {
      this.logger.debug(`[Shard ${shardId}] ready`)
    })
    client.on('shardDisconnect', (ev, shardId) => {
      this.logger.debug(`[Shard ${shardId}] disconnect`)
    })
    client.on('shardReconnecting', (shardId) => {
      this.logger.debug(`[Shard ${shardId}] reconnecting`)
    })
    client.on('shardResume', (shardId) => {
      this.logger.debug(`[Shard ${shardId}] resume`)
    })

    client.on('guildCreate', async (guild) => {
      try {
        await this.saveGuild(guild)
      } catch (error) {
        // Ignore
      }
    })

    client.on('guildDelete', async (guild) => {
      try {
        await this.discordGuildService.updateLeftAt(guild.id)
      } catch (error) {
        // Ignore
      }
    })

    client.once('ready', async () => {
      this.client.guilds.cache.forEach(async (guild) => {
        try {
          await this.saveGuild(guild)
        } catch (error) {
          // Ignore
        }
      })

      const channelIds = (await Promise.allSettled([
        this.trackTwitterTweetService.getDiscordChannelIds(),
        this.trackTwitterProfileService.getDiscordChannelIds(),
        this.trackTwitterSpaceService.getDiscordChannelIds(),
      ]))
        .filter((v) => v.status === 'fulfilled')
        .map((v: any) => v.value as string[])
        .flat()

      this.client.channels.cache.forEach(async (channel) => {
        if (channelIds.includes(channel.id)) {
          try {
            await this.saveChannel(channel as Channel)
          } catch (error) {
            // Ignore
          }
        }
      })
    })

    client.once('ready', () => {
      const { user } = client
      this.logger.info(`${user.tag} ready!`)
    })

    client.once('ready', () => {
      if (this.configService.twitter.active) {
        this.twitterService.start()
      }
      if (this.configService.twitcasting.active) {
        this.twitCastingService.start()
      }
    })

    client.on('interactionCreate', (interaction) => this.handleInteractionCreate(interaction))
  }

  private async saveDiscordChannelData(channel: TextChannel) {
    if (!channel) {
      return
    }
    try {
      await this.saveChannel(channel)
      const guild = await this.getGuild(channel.guildId)
      if (guild) {
        await this.saveGuild(guild)
      }
    } catch (error) {
      this.logger.warn(
        `updateDiscordChannelData: ${error.message}`,
        { channelId: channel.id },
      )
    }
  }

  private async handleInteractionCreate(interaction: Interaction) {
    this.saveUser(interaction.user)
    try {
      if (interaction.isCommand()) {
        await this.handleCommandInteraction(interaction)
        return
      }
    } catch (error) {
      this.logger.error(`handleInteractionCreate: ${error.message}`)
    }
  }

  private async handleCommandInteraction(interaction: CommandInteraction) {
    await interaction.deferReply()

    const { user, commandName } = interaction
    const command = this.commands.get(commandName)
    if (!command) {
      await interaction.editReply('Command not found')
      return
    }

    try {
      this.logger.debug(
        `handleCommandInteraction: Running command [${commandName}]`,
        { user: { id: user.id, tag: user.tag } },
      )
      const instance = this.moduleRef.get(command)
      await instance?.execute?.(interaction)
    } catch (error) {
      this.logger.error(`handleCommandInteraction: ${error.message}`, { command: commandName })
      await interaction.editReply('There was an error while executing this command!')
    }
  }

  private async saveUser(user: User) {
    this.discordUserService.update({
      id: user.id,
      isActive: true,
      createdAt: user.createdTimestamp,
      username: user.username,
      discriminator: user.discriminator,
      tag: user.tag,
    })
  }

  private async saveGuild(guild: Guild) {
    await this.discordGuildService.update({
      id: guild.id,
      isActive: true,
      createdAt: guild.createdTimestamp,
      ownerId: guild.ownerId,
      name: guild.name,
      joinedAt: guild.joinedTimestamp,
      leftAt: null,
    })

    const owner = await guild.fetchOwner()
    if (owner?.user) {
      await this.saveUser(owner.user)
    }
  }

  private async saveChannel(channel: Channel) {
    if (channel instanceof TextChannel) {
      await this.discordChannelService.update({
        id: channel.id,
        isActive: true,
        createdAt: channel.createdTimestamp,
        guildId: channel.guildId,
        name: channel.name,
      })
    }
  }

  private async saveMessage(message: Message) {
    await this.discordMessageService.update({
      id: message.id,
      isActive: true,
      createdAt: message.createdTimestamp,
      authorId: message.author.id,
      channelId: message.channelId,
      guildId: message.guildId,
      url: message.url,
      content: message.content,
    })
    if (message.author) {
      await this.saveUser(message.author)
    }
    if (message.channelId && message.channel) {
      await this.saveChannel(message.channel as Channel)
    }
    if (message.guildId && message.guild) {
      await this.saveGuild(message.guild)
    }
  }
}
