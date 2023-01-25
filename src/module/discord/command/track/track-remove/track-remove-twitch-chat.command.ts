import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enum/track-type.enum'
import { TrackTwitchChatService } from '../../../../track/service/track-twitch-chat.service'
import { TwitchUser } from '../../../../twitch/model/twitch-user.entity'
import { TwitchUserService } from '../../../../twitch/service/data/twitch-user.service'
import { TwitchUtil } from '../../../../twitch/util/twitch.util'
import { TrackRemoveFilter } from '../../../interface/track.interface'
import { DiscordSlashCommandUtil } from '../../../util/discord-slash-command.util'
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
      .addStringOption((option) => DiscordSlashCommandUtil.getUsernameOption(
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
    return `Untrack${filter?.user ? ` **[${filter.user.username}](${TwitchUtil.getUserUrl(filter.user.username)})** from` : ''} **[${user.username}](${TwitchUtil.getUserUrl(user.username)})** Twitch chat`
  }
}
