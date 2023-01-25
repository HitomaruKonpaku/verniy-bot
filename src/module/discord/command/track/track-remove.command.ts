import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { TrackType } from '../../../track/enum/track-type.enum'
import { BaseCommand } from '../base/base-command'
import { TrackRemoveInstagramPostCommand } from './track-remove/track-remove-instagram-post.command'
import { TrackRemoveInstagramProfileCommand } from './track-remove/track-remove-instagram-profile.command'
import { TrackRemoveInstagramStoryCommand } from './track-remove/track-remove-instagram-story.command'
import { TrackRemoveTiktokVideoCommand } from './track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from './track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchChatCommand } from './track-remove/track-remove-twitch-chat.command'
import { TrackRemoveTwitchLiveCommand } from './track-remove/track-remove-twitch-live.command'
import { TrackRemoveTwitterProfileCommand } from './track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from './track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from './track-remove/track-remove-twitter-tweet.command'
import { TrackRemoveYoutubeLiveCommand } from './track-remove/track-remove-youtube-live.command'

@Injectable()
export class TrackRemoveCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: TrackRemoveCommand.name })

  constructor(
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('track_remove')
    .setDescription('Remove tracking')
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) => TrackRemoveTwitterTweetCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTwitterProfileCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTwitterSpaceCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTwitCastingLiveCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackRemoveYoutubeLiveCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTwitchLiveCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTwitchChatCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveInstagramPostCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveInstagramStoryCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackRemoveInstagramProfileCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackRemoveTiktokVideoCommand.getSubcommand(subcommand))

  public async execute(interaction: ChatInputCommandInteraction) {
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
    const instance = {
      [TrackType.TWITTER_TWEET]: TrackRemoveTwitterTweetCommand,
      [TrackType.TWITTER_PROFILE]: TrackRemoveTwitterProfileCommand,
      [TrackType.TWITTER_SPACE]: TrackRemoveTwitterSpaceCommand,
      [TrackType.TWITCASTING_LIVE]: TrackRemoveTwitCastingLiveCommand,
      [TrackType.YOUTUBE_LIVE]: TrackRemoveYoutubeLiveCommand,
      [TrackType.TWITCH_LIVE]: TrackRemoveTwitchLiveCommand,
      [TrackType.TWITCH_CHAT]: TrackRemoveTwitchChatCommand,
      [TrackType.INSTAGRAM_POST]: TrackRemoveInstagramPostCommand,
      [TrackType.INSTAGRAM_STORY]: TrackRemoveInstagramStoryCommand,
      [TrackType.INSTAGRAM_PROFILE]: TrackRemoveInstagramProfileCommand,
      [TrackType.TIKTOK_VIDEO]: TrackRemoveTiktokVideoCommand,
    }[subcommand] || null
    return instance
  }
}
