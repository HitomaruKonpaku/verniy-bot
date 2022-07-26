import { Inject, Injectable } from '@nestjs/common'
import { SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackType } from '../../../../track/enums/track-type.enum'
import { TrackTwitCastingLiveService } from '../../../../track/services/track-twitcasting-live.service'
import { TwitCastingUser } from '../../../../twitcasting/models/twitcasting-user.entity'
import { TwitCastingUserService } from '../../../../twitcasting/services/data/twitcasting-user.service'
import { TwitCastingUtils } from '../../../../twitcasting/utils/twitcasting.utils'
import { DiscordSlashCommandUtils } from '../../../utils/discord-slash-command.utils'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTwitCastingLiveCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTwitCastingLiveCommand.name })

  constructor(
    @Inject(TrackTwitCastingLiveService)
    protected readonly trackService: TrackTwitCastingLiveService,
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName(TrackType.TWITCASTING_LIVE)
      .setDescription('Untrack user live')
      .addStringOption((option) => DiscordSlashCommandUtils.getUsernameOption(
        option,
        { description: 'TwitCasting user, e.g. "nakiriayame"' },
      ))
  }

  protected async getUser(username: string): Promise<TwitCastingUser> {
    const user = await this.twitCastingUserService.getOneByIdOrScreenId(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitCastingUser): string {
    return `Untrack **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})** TwitCasting`
  }
}
