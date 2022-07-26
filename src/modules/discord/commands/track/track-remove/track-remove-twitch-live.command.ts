import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitchLiveService } from '../../../../track/services/track-twitch-live.service'
import { TwitchUser } from '../../../../twitch/models/twitch-user.entity'
import { TwitchUserService } from '../../../../twitch/services/data/twitch-user.service'
import { TwitchUtils } from '../../../../twitch/utils/twitch.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitchLiveCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitchLiveCommand.name })

  constructor(
    @Inject(TrackTwitchLiveService)
    protected readonly trackService: TrackTwitchLiveService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCH_LIVE)
      .setDescription('Untrack user live')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'Twitch user, e.g. "nakiriayame_hololive"' },
      ))
  }

  protected async getUser(username: string): Promise<TwitchUser> {
    const user = await this.twitchUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitchUser): string {
    return `Untrack **[${user.username}](${TwitchUtils.getUserUrl(user.username)})** Twitch live`
  }
}
