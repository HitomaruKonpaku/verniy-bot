import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  Channel,
  Client,
  Collection,
  CommandInteraction,
  Guild,
  Interaction,
  MessageOptions,
  MessagePayload,
  TextChannel,
  User,
} from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { DiscordChannelService } from '../../database/services/discord-channel.service'
import { DiscordGuildService } from '../../database/services/discord-guild.service'
import { DiscordUserService } from '../../database/services/discord-user.service'
import { TrackTwitterProfileService } from '../../database/services/track-twitter-profile.service'
import { TrackTwitterTweetService } from '../../database/services/track-twitter-tweet.service'
import { TwitterService } from '../../twitter/services/twitter.service'
import { DISCORD_COMMANDS } from '../constants/discord-command.constant'
import { DISCORD_CLIENT_OPTIONS } from '../constants/discord.constant'

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
    @Inject(forwardRef(() => TrackTwitterTweetService))
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(forwardRef(() => TrackTwitterProfileService))
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
    @Inject(forwardRef(() => TwitterService))
    private readonly twitterService: TwitterService,
  ) {
    this.initClient()
  }

  public async start() {
    this.logger.info('Starting...')
    try {
      const token = process.env.DISCORD_TOKEN
      if (!token) {
        this.logger.warn('Token not found')
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
    const commands = DISCORD_COMMANDS
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
      ]))
        .filter((v) => v.status === 'fulfilled')
        .map((v: any) => v.value as string[])
        .flat()

      this.client.channels.cache.forEach(async (channel) => {
        if (channelIds.includes(channel.id) && channel instanceof TextChannel) {
          try {
            await this.saveTextChannel(channel)
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
      if (!this.configService.twitter.active) {
        return
      }
      this.twitterService.start()
    })

    client.on('interactionCreate', (interaction) => this.handleInteractionCreate(interaction))
  }

  private async saveDiscordChannelData(channel: TextChannel) {
    if (!channel) {
      return
    }
    try {
      await this.saveTextChannel(channel)
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
      createdAt: new Date(user.createdTimestamp),
      username: user.username,
      discriminator: user.discriminator,
      tag: user.tag,
    })
  }

  private async saveGuild(guild: Guild) {
    await this.discordGuildService.update({
      id: guild.id,
      createdAt: new Date(guild.createdTimestamp),
      ownerId: guild.ownerId,
      name: guild.name,
      joinedAt: new Date(guild.joinedTimestamp),
      leftAt: null,
    })

    const owner = await guild.fetchOwner()
    if (owner?.user) {
      await this.saveUser(owner.user)
    }
  }

  private async saveTextChannel(channel: TextChannel) {
    await this.discordChannelService.update({
      id: channel.id,
      createdAt: new Date(channel.createdTimestamp),
      guildId: channel.guildId,
      name: channel.name,
    })
  }
}
