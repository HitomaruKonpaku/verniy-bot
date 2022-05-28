import { Inject, Injectable } from '@nestjs/common'
import {
  Guild,
  Message,
  TextChannel,
  User,
} from 'discord.js'
import { baseLogger } from '../../../logger'
import { DiscordChannelService } from './data/discord-channel.service'
import { DiscordGuildService } from './data/discord-guild.service'
import { DiscordMessageService } from './data/discord-message.service'
import { DiscordUserService } from './data/discord-user.service'

@Injectable()
export class DiscordDbService {
  private readonly logger = baseLogger.child({ context: DiscordDbService.name })

  constructor(
    @Inject(DiscordUserService)
    private readonly discordUserService: DiscordUserService,
    @Inject(DiscordGuildService)
    private readonly discordGuildService: DiscordGuildService,
    @Inject(DiscordChannelService)
    private readonly discordChannelService: DiscordChannelService,
    @Inject(DiscordMessageService)
    private readonly discordMessageService: DiscordMessageService,
  ) { }

  public async saveUser(user: User) {
    try {
      await this.discordUserService.save({
        id: user.id,
        isActive: true,
        createdAt: user.createdTimestamp,
        username: user.username,
        discriminator: user.discriminator,
        tag: user.tag,
      })
    } catch (error) {
      this.logger.error(`saveUser: ${error.message}`, { id: user.id, tag: user.tag })
    }
  }

  public async saveGuild(guild: Guild) {
    try {
      await this.discordGuildService.save({
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
    } catch (error) {
      this.logger.error(`saveGuild: ${error.message}`, { id: guild.id, name: guild.name })
    }
  }

  public async saveTextChannel(channel: TextChannel) {
    try {
      await this.discordChannelService.save({
        id: channel.id,
        isActive: true,
        createdAt: channel.createdTimestamp,
        guildId: channel.guildId,
        name: channel.name,
      })
    } catch (error) {
      this.logger.error(`saveTextChannel: ${error.message}`, { id: channel.id, name: channel.name })
    }
  }

  public async saveMessage(message: Message) {
    try {
      await this.discordMessageService.save({
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
        await this.saveTextChannel(message.channel as TextChannel)
      }
      if (message.guildId && message.guild) {
        await this.saveGuild(message.guild)
      }
    } catch (error) {
      this.logger.error(`saveMessage: ${error.message}`, { id: message.id })
    }
  }
}
