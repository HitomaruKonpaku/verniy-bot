/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitchChatService } from '../../../../track/services/track-twitch-chat.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserControllerService } from '../../../../twitch/services/controller/twitch-user-controller.service'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchChatTrackingService } from '../../../../twitch/services/tracking/twitch-chat-tracking.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackAddFilter } from '../../../interfaces/track.interface'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitchChatCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitchChatCommand.name })

  constructor(
    @Inject(TrackTwitchChatService)
    protected readonly trackService: TrackTwitchChatService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
    @Inject(TwitchChatTrackingService)
    private readonly twitchChatTrackingService: TwitchChatTrackingService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCH_CHAT)
      .setDescription('Track user chat')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitch user, e.g. "nakiriayame_hololive"' },
      ))
      .addStringOption((option) => DiscordSlashCommandUtils.getMessageOption(option))
      .addStringOption((option) => option
        .setName('filter_username')
        .setDescription('Author username')
        .setRequired(false))
      .addStringOption((option) => option
        .setName('filter_keywords')
        .setDescription('Keywords for filtering message by filter_username, separated by commas (,)')
        .setRequired(false))
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserControllerService.fetchUserByUsername(username)
    return user
  }

  protected async onSuccess(
    interaction: ChatInputCommandInteraction,
    user: TwitchUser,
    filter?: TrackAddFilter<TwitchUser>,
  ) {
    if (filter?.user) {
      this.twitchChatTrackingService.addFilterUserId(filter.user.id)
    }
    await this.twitchChatTrackingService.joinChannel(user.username)
    await super.onSuccess(interaction, user, filter)
  }

  protected getSuccessEmbedDescription(
    user: TwitchUser,
    filter?: TrackAddFilter<TwitchUser>,
  ): string {
    return [
      `Tracking${filter?.user ? ` **[${filter.user.username}](${TwitchUtils.getUserUrl(filter.user.username)})** from` : ''} **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch chat`,
      filter?.keywords?.length ? `Keywords: ${filter.keywords.join(', ')}` : '',
    ].filter((v) => v).join('\n')
  }
}
