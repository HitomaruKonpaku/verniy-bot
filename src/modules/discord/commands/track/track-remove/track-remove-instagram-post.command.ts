import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { InstagramUser } from '../../../../instagram/models/instagram-user.entity'
import { InstagramUserService } from '../../../../instagram/services/data/instagram-user.service'
import { InstagramUtils } from '../../../../instagram/utils/instagram.utils'
import { TrackInstagramPostService } from '../../../../track/services/track-instagram-post.service'
import { TrackRemoveBaseSubcommand } from '../base/track-remove-base-subcommand'

@Injectable()
export class TrackRemoveInstagramPostCommand extends TrackRemoveBaseSubcommand {
  logger = baseLogger.child({ context: TrackRemoveInstagramPostCommand.name })

  constructor(
    @Inject(TrackInstagramPostService)
    protected readonly trackService: TrackInstagramPostService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
  ) {
    super()
  }

  protected async getUser(username: string): Promise<InstagramUser> {
    const user = await this.instagramUserService.getOneByUsername(username)
    return user
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSuccessEmbedDescription(user: InstagramUser): string {
    return `Untrack **[${user.username}](${InstagramUtils.getUserUrl(user.username)})** Instagram posts`
  }
}
