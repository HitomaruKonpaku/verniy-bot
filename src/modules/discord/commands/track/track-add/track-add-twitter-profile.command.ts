/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { TrackTwitterProfileService } from '../../../../track/services/track-twitter-profile.service'
import { TwitterUser } from '../../../../twitter/models/twitter-user.entity'
import { TwitterUserControllerService } from '../../../../twitter/services/controller/twitter-user-controller.service'
import { TwitterUtils } from '../../../../twitter/utils/twitter.utils'
import { TrackAddBaseSubcommand } from '../base/track-add-base-subcommand'

@Injectable()
export class TrackAddTwitterProfileCommand extends TrackAddBaseSubcommand {
  logger = baseLogger.child({ context: TrackAddTwitterProfileCommand.name })

  constructor(
    @Inject(TrackTwitterProfileService)
    protected readonly trackService: TrackTwitterProfileService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<TwitterUser> {
    const user = await this.twitterUserControllerService.getOneByUsername(username)
    return user
  }

  protected getSuccessEmbedDescription(user: TwitterUser): string {
    return `Tracking **[${user.username}](${TwitterUtils.getUserUrl(user.username)})** Twitter profile`
  }
}
