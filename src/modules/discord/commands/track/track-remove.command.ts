import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { TrackType } from '../../../track/enums/track-type.enum'
import { BaseCommand } from '../base/base.command'
import { TrackRemoveInstagramPostCommand } from './track-remove/track-remove-instagram-post.command'
import { TrackRemoveInstagramProfileCommand } from './track-remove/track-remove-instagram-profile.command'
import { TrackRemoveInstagramStoryCommand } from './track-remove/track-remove-instagram-story.command'
import { TrackRemoveTiktokVideoCommand } from './track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from './track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchLiveCommand } from './track-remove/track-remove-twitch-live.command'
import { TrackRemoveTwitterProfileCommand } from './track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from './track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from './track-remove/track-remove-twitter-tweet.command'

@Injectable()
export class TrackRemoveCommand extends BaseCommand {
  public static readonly command = new SlashCommandBuilder()
    .setName('track_remove')
    .setDescription('Remove tracking')
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TWITTER_TWEET)
      .setDescription('Untrack user tweets')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TWITTER_PROFILE)
      .setDescription('Untrack user profile changes')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TWITTER_SPACE)
      .setDescription('Untrack Spaces from user')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitter username, e.g. "nakiriayame"')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TWITCASTING_LIVE)
      .setDescription('Untrack user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TwitCasting user, e.g. "nakiriayame"')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TWITCH_LIVE)
      .setDescription('Untrack user live')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Twitch user, e.g. "nakiriayame_hololive"')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.INSTAGRAM_POST)
      .setDescription('Untrack user posts')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Instagram user')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.INSTAGRAM_STORY)
      .setDescription('Untrack user stories')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Instagram user')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.INSTAGRAM_PROFILE)
      .setDescription('Untrack user profile')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('Instagram user')
        .setRequired(true)))
    //
    .addSubcommand((subcommand) => subcommand
      .setName(TrackType.TIKTOK_VIDEO)
      .setDescription('Untrack user videos')
      .addStringOption((option) => option
        .setName('username')
        .setDescription('TikTok user, e.g. "hololive_english"')
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
      case TrackType.TWITTER_TWEET:
        return TrackRemoveTwitterTweetCommand
      case TrackType.TWITTER_PROFILE:
        return TrackRemoveTwitterProfileCommand
      case TrackType.TWITTER_SPACE:
        return TrackRemoveTwitterSpaceCommand
      case TrackType.TWITCASTING_LIVE:
        return TrackRemoveTwitCastingLiveCommand
      case TrackType.TWITCH_LIVE:
        return TrackRemoveTwitchLiveCommand
      case TrackType.INSTAGRAM_POST:
        return TrackRemoveInstagramPostCommand
      case TrackType.INSTAGRAM_STORY:
        return TrackRemoveInstagramStoryCommand
      case TrackType.INSTAGRAM_PROFILE:
        return TrackRemoveInstagramProfileCommand
      case TrackType.TIKTOK_VIDEO:
        return TrackRemoveTiktokVideoCommand
      default:
        return null
    }
  }
}
