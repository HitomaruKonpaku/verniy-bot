import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterSpaceService } from '../../../../track/services/track-twitter-space.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitterSpaceCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitterSpaceCommand.name })

  constructor(
    @Inject(TrackTwitterSpaceService)
    protected readonly trackService: TrackTwitterSpaceService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Spaces`
  }
}
