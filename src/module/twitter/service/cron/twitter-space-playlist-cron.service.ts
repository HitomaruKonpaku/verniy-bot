import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { TwitterSpace } from '../../model/twitter-space.entity'
import { TwitterSpaceControllerService } from '../controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../data/twitter-space.service'

@Injectable()
export class TwitterSpacePlaylistCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterSpacePlaylistCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    private readonly twitterSpaceControllerService: TwitterSpaceControllerService,
  ) {
    super()
    this.cronTime = this.configVarService.getString('TWITTER_CRON_SPACE_PLAYLIST_EXPRESSION')
  }

  private get maxConcurrent() {
    return this.configVarService.getNumber('TWITTER_CRON_SPACE_PLAYLIST_MAX_CONCURRENT')
  }

  private get limit() {
    return this.configVarService.getNumber('TWITTER_CRON_SPACE_PLAYLIST_LIMIT')
  }

  protected async onTick() {
    this.checkSpaces()
  }

  private async getSpaces() {
    const spaces = await this.twitterSpaceService.getManyPlaylistActive({ limit: this.limit })
    return spaces
  }

  private async checkSpaces() {
    try {
      if (this.limit <= 0) {
        return
      }

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
