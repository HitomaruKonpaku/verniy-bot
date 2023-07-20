import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { TwitterSpace } from '../../model/twitter-space.entity'
import { TwitterSpaceControllerService } from '../controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../data/twitter-space.service'

@Injectable()
export class TwitterSpacePlaylistCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterSpacePlaylistCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  private maxConcurrent = 5
  private limit = 20

  constructor(
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    private readonly twitterSpaceControllerService: TwitterSpaceControllerService,
  ) {
    super()
  }

  protected async onTick() {
    this.logger.debug('onTick')
    this.checkSpaces()
  }

  private async getSpaces() {
    const spaces = await this.twitterSpaceService.getManyForPlaylistCheck({ limit: this.limit })
    return spaces
  }

  private async checkSpaces() {
    try {
      const spaces = await this.getSpaces()
      this.logger.debug('checkSpaces', { spaceCount: spaces.length })
      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(spaces.map((v) => limiter.schedule(() => this.checkSpace(v))))
    } catch (error) {
      this.logger.error(`checkSpaces: ${error.message}`)
    }
  }

  private async checkSpace(space: TwitterSpace) {
    try {
      await this.twitterSpaceControllerService.checkPlaylistStatus(
        space.id,
        space.playlistUrl,
      )
    } catch (error) {
      this.logger.error(`checkSpace: ${error.message}`, { id: space.id })
    }
  }
}
