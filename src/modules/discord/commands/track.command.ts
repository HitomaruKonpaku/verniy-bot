import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction, TextChannel } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitterProfileService } from '../../track/services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from '../../track/services/track-twitter-space.service'
import { TrackTwitterTweetService } from '../../track/services/track-twitter-tweet.service'
import { TwitterApiService } from '../../twitter/services/twitter-api.service'
import { TwitterUserService } from '../../twitter/services/twitter-user.service'
import { TwitterUtils } from '../../twitter/utils/twitter.utils'

@Injectable()
export class TrackCommand {
  private readonly logger = baseLogger.child({ context: TrackCommand.name })

  constructor(
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
  ) { }

  public static readonly command = new SlashCommandBuilder()
    .setName('track')
    .setDescription('Track Twitter user')
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
      .setDescription('Track user profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))
    .addSubcommand((subcommand) => subcommand
      .setName('space')
      .setDescription('Track user Spaces')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('message')
        .setDescription('Discord message')))

  public async execute(interaction: CommandInteraction) {
    if (interaction.guild) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.editReply(`Required ${bold(inlineCode('MANAGE_MESSAGES'))} permission!`)
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
      default:
        this.logger.warn(`execute: Unhandled subcommand: ${subcommand}`, { subcommand })
    }
  }

  private async executeTweetCommand(interaction: CommandInteraction) {
    const { username, channelId, message } = this.extractBaseOptions(interaction)
    const allowReply = interaction.options.getBoolean('allow_reply') ?? true
    const allowRetweet = interaction.options.getBoolean('allow_retweet') ?? true
    try {
      const twitterUser = await this.getTwitterUser(username)
      await this.trackTwitterTweetService.add(
        twitterUser.id,
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
          description: `Tracking **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** tweets`,
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
      const twitterUser = await this.getTwitterUser(username)
      await this.trackTwitterProfileService.add(
        twitterUser.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('<-- executeProfileCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** profile`,
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
      const twitterUser = await this.getTwitterUser(username)
      await this.trackTwitterSpaceService.add(
        twitterUser.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('<-- executeSpaceCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** Spaces`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`executeSpaceCommand: ${error.message}`, { username, channelId })
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
    let twitterUser = await this.twitterUserService.getOneByUsername(username)
    if (!twitterUser) {
      const user = await this.twitterApiService.getUserByUsername(username)
      twitterUser = await this.twitterUserService.updateByUserObject(user)
    }
    return twitterUser
  }
}
