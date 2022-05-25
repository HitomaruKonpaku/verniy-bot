import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction, TextChannel } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitCastingLiveService } from '../../track/services/track-twitcasting-live.service'
import { TrackTwitterProfileService } from '../../track/services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from '../../track/services/track-twitter-space.service'
import { TrackTwitterTweetService } from '../../track/services/track-twitter-tweet.service'
import { TwitCastingUserService } from '../../twitcasting/services/data/twitcasting-user.service'
import { TwitCastingUtils } from '../../twitcasting/utils/twitcasting.utils'
import { TwitterUserService } from '../../twitter/services/data/twitter-user.service'
import { TwitterUtils } from '../../twitter/utils/twitter.utils'
import { BaseCommand } from './base/base.command'

@Injectable()
export class UntrackCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: UntrackCommand.name })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
    @Inject(TrackTwitCastingLiveService)
    private readonly trackTwitCastingLiveService: TrackTwitCastingLiveService,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Untrack')
    .addSubcommand((subcommand) => subcommand
      .setName('tweet')
      .setDescription('Untrack user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('profile')
      .setDescription('Untrack user Twitter profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('space')
      .setDescription('Untrack user Twitter Spaces')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('twitcasting')
      .setDescription('Untrack TwitCasting user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TwitCasting id')
        .setRequired(true)))

  public async execute(interaction: CommandInteraction) {
    if (interaction.guild) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await this.replyMissingPermission(interaction, 'MANAGE_MESSAGES')
        return
      }
    }

    const subcommand = interaction.options.getSubcommand()
    const meta = {
      user: { id: interaction.user.id, tag: interaction.user.tag },
      channel: { id: interaction.channelId, name: (interaction.channel as TextChannel)?.name },
      guild: { id: interaction.guildId, name: interaction.guild?.name },
    }
    switch (subcommand) {
      case 'tweet':
        this.logger.info('--> executeTweetCommand', meta)
        await this.executeTweetCommand(interaction)
        return
      case 'profile':
        this.logger.info('--> executeProfileCommand', meta)
        await this.executeProfileCommand(interaction)
        return
      case 'space':
        this.logger.info('--> executeSpaceCommand', meta)
        await this.executeSpaceCommand(interaction)
        return
      case 'twitcasting':
        this.logger.info('--> executeTwitCastingCommand', meta)
        await this.executeTwitCastingCommand(interaction)
        return
      default:
        this.logger.warn(`execute: Unhandled subcommand: ${subcommand}`, { subcommand })
    }
  }

  private async executeTweetCommand(interaction: CommandInteraction) {
    const { username, channelId } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitterUser(username)
      if (!user) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterTweetService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeTweetCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeTweetCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeProfileCommand(interaction: CommandInteraction) {
    const { username, channelId } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitterUser(username)
      if (!user) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterProfileService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeProfileCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** profile`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeProfileCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeSpaceCommand(interaction: CommandInteraction) {
    const { username, channelId } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitterUser(username)
      if (!user) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterSpaceService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeSpaceCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Spaces`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeSpaceCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeTwitCastingCommand(interaction: CommandInteraction) {
    const { username, channelId } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitCastingUser(username)
      if (!user) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitCastingLiveService.remove(user.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeTwitCastingCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})** TwitCasting user`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeTwitCastingCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private extractBaseOptions(interaction: CommandInteraction) {
    const opts = {
      channelId: interaction.channelId,
      username: interaction.options.getString('username', true),
    }
    return opts
  }

  private async getTwitterUser(username: string) {
    const user = await this.twitterUserService.getOneByUsername(username)
    return user
  }

  private async getTwitCastingUser(username: string) {
    const user = await this.twitCastingUserService.getOneByIdOrScreenId(username)
    return user
  }
}
