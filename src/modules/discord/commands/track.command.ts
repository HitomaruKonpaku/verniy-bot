import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction, TextChannel, User } from 'discord.js'
import { baseLogger } from '../../../logger'
import { TrackTwitCastingLiveService } from '../../track/services/track-twitcasting-live.service'
import { TrackTwitterProfileService } from '../../track/services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from '../../track/services/track-twitter-space.service'
import { TrackTwitterTweetService } from '../../track/services/track-twitter-tweet.service'
import { TwitCastingUserControllerService } from '../../twitcasting/services/controller/twitcasting-user-controller.service'
import { TwitCastingUtils } from '../../twitcasting/utils/twitcasting.utils'
import { TwitterUserControllerService } from '../../twitter/services/controller/twitter-user-controller.service'
import { TwitterFilteredStreamUserService } from '../../twitter/services/data/twitter-filtered-stream-user.service'
import { TwitterUtils } from '../../twitter/utils/twitter.utils'
import { BaseCommand } from './base/base.command'

@Injectable()
export class TrackCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackCommand.name })

  constructor(
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
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
    .setName('track')
    .setDescription('Track')
    .addSubcommand((subcommand) => subcommand
      .setName('tweet')
      .setDescription('Track user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message'))
      .addBooleanOption((option) => option
        .setName('allow_reply')
        .setDescription('Allow reply?'))
      .addBooleanOption((option) => option
        .setName('allow_retweet')
        .setDescription('Allow retweet?')))
    .addSubcommand((subcommand) => subcommand
      .setName('profile')
      .setDescription('Track Twitter user profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))
    .addSubcommand((subcommand) => subcommand
      .setName('space')
      .setDescription('Track Twitter Spaces from user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))
    .addSubcommand((subcommand) => subcommand
      .setName('twitcasting')
      .setDescription('Track TwitCasting user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TwitCasting id')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))

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
    const { username, channelId, message } = this.extractBaseOptions(interaction)
    const allowReply = interaction.options.getBoolean('allow_reply') ?? true
    const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
    try {
      const user = await this.getTwitterUser(username)
      if (!await this.twitterFilteredStreamUserService.getOneById(user.id)) {
        const owner = interaction.client.application.owner as User
        const content = `> Due to Twitter API limitation, please contact ${bold(inlineCode(owner.tag))} to request to add this user to tracking list`
        interaction.editReply(content)
        this.logger.warn('<-- executeTweetCommand#ignore', { username, channelId })
        return
      }
      await this.trackTwitterTweetService.add(
        user.id,
        channelId,
        message,
        allowReply,
        allowRetweet,
        null,
        interaction.user.id,
      )
      this.logger.warn('<-- executeTweetCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** tweets`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeTweetCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeProfileCommand(interaction: CommandInteraction) {
    const { username, channelId, message } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitterUser(username)
      await this.trackTwitterProfileService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('<-- executeProfileCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** profile`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeProfileCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeSpaceCommand(interaction: CommandInteraction) {
    const { username, channelId, message } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitterUser(username)
      await this.trackTwitterSpaceService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('<-- executeSpaceCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Spaces`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeSpaceCommand: ${error.message}`, { username, channelId })
      await interaction.editReply(error.message)
    }
  }

  private async executeTwitCastingCommand(interaction: CommandInteraction) {
    const { username, channelId, message } = this.extractBaseOptions(interaction)
    try {
      const user = await this.getTwitCastingUser(username)
      await this.trackTwitCastingLiveService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('<-- executeTwitCastingCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})** TwitCasting user`,
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
      message: interaction.options.getString('message') || null,
    }
    return opts
  }

  private async getTwitterUser(username: string) {
    const user = await this.twitterUserControllerService.getOneByUsername(username)
    return user
  }

  private async getTwitCastingUser(username: string) {
    const user = await this.twitCastingUserControllerService.getOneAndSaveById(username)
    return user
  }
}
