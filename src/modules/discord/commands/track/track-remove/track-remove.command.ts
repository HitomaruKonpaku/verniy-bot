import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseCommand } from '../../base/base.command'
import { TrackRemoveTwitCastingLiveCommand } from './track-remove-twitcasting-live.command'
import { TrackRemoveTwitchUserStreamCommand } from './track-remove-twitch-user-stream.command'
import { TrackRemoveTwitterProfileCommand } from './track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from './track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from './track-remove-twitter-tweet.command'

@Injectable()
export class TrackRemoveCommand extends BaseCommand {
  public static readonly command = new SlashCommandBuilder()
    .setName('track_remove')
    .setDescription('Remove tracking')
    // twitter_tweet
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_tweet')
      .setDescription('Untrack user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    // twitter_profile
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_profile')
      .setDescription('Untrack user profile changes')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    // twitter_space
    .addSubcommand((subcommand) => subcommand
      .setName('twitter_space')
      .setDescription('Untrack Spaces from user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    // twitcasting_live
    .addSubcommand((subcommand) => subcommand
      .setName('twitcasting_live')
      .setDescription('Untrack user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TwitCasting user, e.g. "nakiriayame"')
        .setRequired(true)))
    // twitch_user_stream
    .addSubcommand((subcommand) => subcommand
      .setName('twitch_user_stream')
      .setDescription('Untrack user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitch user, e.g. "nakiriayame_hololive"')
        .setRequired(true)))

  private readonly logger = baseLogger.child({ context: TrackRemoveCommand.name })

  constructor(
    @Inject(ModuleRef)
    private moduleRef: ModuleRef,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    if (interaction.guild) {
      const member = await interaction.guild.members.fetch(interaction.user.id)
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await this.replyMissingPermission(interaction, 'MANAGE_MESSAGES')
        return
      }
    }

    const subcommand = interaction.options.getSubcommand()
    const instance = this.moduleRef.get(this.getCommandService(subcommand))
    await instance?.execute?.(interaction)
  }

  private getCommandService(subcommand: string) {
    this.logger.debug(`getCommandService: ${subcommand}`)
    switch (subcommand) {
      case 'twitter_tweet':
        return TrackRemoveTwitterTweetCommand
      case 'twitter_profile':
        return TrackRemoveTwitterProfileCommand
      case 'twitter_space':
        return TrackRemoveTwitterSpaceCommand
      case 'twitcasting_live':
        return TrackRemoveTwitCastingLiveCommand
      case 'twitch_user_stream':
        return TrackRemoveTwitchUserStreamCommand
      default:
        return null
    }
  }
}
