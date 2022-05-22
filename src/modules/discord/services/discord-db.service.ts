import { Inject, Injectable } from '@nestjs/common'
import {
  Guild,
  Message,
  TextChannel,
  User,
} from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { DiscordChannelService } from './discord-channel.service'
import { DiscordGuildService } from './discord-guild.service'
import { DiscordMessageService } from './discord-message.service'
import { DiscordUserService } from './discord-user.service'

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
    this.discordUserService.update({
      id: user.id,
      isActive: true,
      createdAt: user.createdTimestamp,
      username: user.username,
      discriminator: user.discriminator,
      tag: user.tag,
    })
  }

  public async saveGuild(guild: Guild) {
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

  public async saveTextChannel(channel: TextChannel) {
    await this.discordChannelService.update({
      id: channel.id,
      isActive: true,
      createdAt: channel.createdTimestamp,
      guildId: channel.guildId,
      name: channel.name,
    })
  }

  public async saveMessage(message: Message) {
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
      await this.saveTextChannel(message.channel as TextChannel)
    }
    if (message.guildId && message.guild) {
      await this.saveGuild(message.guild)
    }
  }
}
