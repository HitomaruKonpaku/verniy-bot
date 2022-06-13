import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TiktokUser } from '../../../../tiktok/models/tiktok-user.entity'
import { TiktokUserService } from '../../../../tiktok/services/data/tiktok-user.service'
import { TiktokUtils } from '../../../../tiktok/utils/tiktok.utils'
import { TrackTiktokVideoService } from '../../../../track/services/track-tiktok-video.service'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveTiktokVideoCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveTiktokVideoCommand.name })

  constructor(
    @Inject(TrackTiktokVideoService)
    protected readonly trackService: TrackTiktokVideoService,
    @Inject(TiktokUserService)
    private readonly tiktokUserService: TiktokUserService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TiktokUser> {
    const user = await this.tiktokUserService.getOneById(username)

    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TiktokUser): string {
    return `Untrack **[${user.username}](${TiktokUtils.getUserUrl(user.username)})** TikTok`
  }
}
