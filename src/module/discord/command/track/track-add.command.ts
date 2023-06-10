import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PermissionFlagsBits } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { TrackType } from '../../../track/enum/track-type.enum'
import { BaseCommand } from '../base/base-command'
import { TrackAddInstagramPostCommand } from './track-add/track-add-instagram-post.command'
import { TrackAddInstagramProfileCommand } from './track-add/track-add-instagram-profile.command'
import { TrackAddInstagramStoryCommand } from './track-add/track-add-instagram-story.command'
import { TrackAddTiktokVideoCommand } from './track-add/track-add-tiktok-video.command'
import { TrackAddTwitCastingLiveCommand } from './track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchChatCommand } from './track-add/track-add-twitch-chat.command'
import { TrackAddTwitchLiveCommand } from './track-add/track-add-twitch-live.command'
import { TrackAddTwitterProfileCommand } from './track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from './track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from './track-add/track-add-twitter-tweet.command'
import { TrackAddYoutubeLiveCommand } from './track-add/track-add-youtube-live.command'

@Injectable()
export class TrackAddCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: TrackAddCommand.name })

  constructor(
    @Inject(ModuleRef)
    private readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('track_add')
    .setDescription('Add or update tracking')
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) => TrackAddTwitterTweetCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTwitterProfileCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTwitterSpaceCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTwitCastingLiveCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackAddYoutubeLiveCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTwitchLiveCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTwitchChatCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackAddInstagramPostCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackAddInstagramStoryCommand.getSubcommand(subcommand))
    // .addSubcommand((subcommand) => TrackAddInstagramProfileCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => TrackAddTiktokVideoCommand.getSubcommand(subcommand))

  public async execute(interaction: ChatInputCommandInteraction) {
    const PFB = PermissionFlagsBits
    if (interaction.guild) {
      const { channel } = interaction
      if (!channel.isTextBased()) {
        await interaction.editReply('Channel type invalid')
        return
      }
      if (!channel.permissionsFor(interaction.client.user).has(PFB.SendMessages)) {
        await this.replyBotMissingPermission(interaction, 'SEND_MESSAGES')
        return
      }
      if (!channel.permissionsFor(interaction.user).has(PFB.ManageMessages)) {
        await this.replyUserMissingPermission(interaction, 'MANAGE_MESSAGES')
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
      [TrackType.TWITTER_TWEET]: TrackAddTwitterTweetCommand,
      [TrackType.TWITTER_PROFILE]: TrackAddTwitterProfileCommand,
      [TrackType.TWITTER_SPACE]: TrackAddTwitterSpaceCommand,
      [TrackType.TWITCASTING_LIVE]: TrackAddTwitCastingLiveCommand,
      [TrackType.YOUTUBE_LIVE]: TrackAddYoutubeLiveCommand,
      [TrackType.TWITCH_LIVE]: TrackAddTwitchLiveCommand,
      [TrackType.TWITCH_CHAT]: TrackAddTwitchChatCommand,
      [TrackType.INSTAGRAM_POST]: TrackAddInstagramPostCommand,
      [TrackType.INSTAGRAM_STORY]: TrackAddInstagramStoryCommand,
      [TrackType.INSTAGRAM_PROFILE]: TrackAddInstagramProfileCommand,
      [TrackType.TIKTOK_VIDEO]: TrackAddTiktokVideoCommand,
    }[subcommand] || null
    return instance
  }
}
