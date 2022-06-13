import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitCastingLiveService } from '../../../../track/services/track-twitcasting-live.service'
import { TwitCastingUser } from '../../../../twitcasting/models/twitcasting-user.entity'
import { TwitCastingUserService } from '../../../../twitcasting/services/data/twitcasting-user.service'
import { TwitCastingUtils } from '../../../../twitcasting/utils/twitcasting.utils'
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

  protected async getUser(username: string): Promise<TwitCastingUser> {
    const user = await this.twitCastingUserService.getOneByIdOrScreenId(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitCastingUser): string {
    return `Untrack **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})** TwitCasting`
  }
}
