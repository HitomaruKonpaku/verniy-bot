import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitchChatService } from '../../../../track/services/track-twitch-chat.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { TrackRemoveFilter } from '../../../interfaces/track.interface'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitchChatCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitchChatCommand.name })

  constructor(
    @Inject(TrackTwitchChatService)
    protected readonly trackService: TrackTwitchChatService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCH_CHAT)
      .setDescription('Untrack user chat')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitch user, e.g. "nakiriayame_hololive"' },
      ))
      .addStringOption((option) => option
        .setName('filter_username')
        .setDescription('Author username')
        .setRequired(false))
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(
    user: TwitchUser,
    filter?: TrackRemoveFilter<TwitchUser>,
  ): string {
    return `Untrack${filter?.user ? ` **[${filter.user.username}](${TwitchUtils.getUserUrl(filter.user.username)})** from` : ''} **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch chat`
  }
}
