import { bold, inlineCode, SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction, TextChannel } from 'discord.js'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitterProfileService } from '../../track/services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from '../../track/services/track-twitter-space.service'
import { TrackTwitterTweetService } from '../../track/services/track-twitter-tweet.service'
import { TwitterUserService } from '../../twitter/services/twitter-user.service'
import { TwitterUtils } from '../../twitter/utils/twitter.utils'

@Injectable()
export class UntrackCommand {
  private readonly logger = baseLogger.child({ context: UntrackCommand.name })

  constructor(
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
    .setName('untrack')
    .setDescription('Untrack Twitter user')
    .addSubcommand((subcommand) => subcommand
      .setName('tweet')
      .setDescription('Untrack user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('profile')
      .setDescription('Untrack user profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('space')
      .setDescription('Untrack user Spaces')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username')
        .setRequired(true)))

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
    const { username, channelId } = this.extractBaseOptions(interaction)
    try {
      const twitterUser = await this.getTwitterUser(username)
      if (!twitterUser) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterTweetService.remove(twitterUser.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeTweetCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** tweets`,
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
      const twitterUser = await this.getTwitterUser(username)
      if (!twitterUser) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterProfileService.remove(twitterUser.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeProfileCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** profile`,
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
      const twitterUser = await this.getTwitterUser(username)
      if (!twitterUser) {
        await interaction.editReply('User not found')
        return
      }
      await this.trackTwitterSpaceService.remove(twitterUser.id, channelId, interaction.user.id)
      this.logger.warn('<-- executeSpaceCommand', { username, channelId })
      await interaction.editReply({
        embeds: [{
          description: `Untrack **[${twitterUser.username}](${TwitterUtils.getUserUrl(twitterUser.username)})** Spaces`,
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
    }
    return opts
  }

  private async getTwitterUser(username: string) {
    const twitterUser = await this.twitterUserService.getOneByUsername(username)
    return twitterUser
  }
}
