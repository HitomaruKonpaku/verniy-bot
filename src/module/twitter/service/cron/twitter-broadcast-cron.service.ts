import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { TwitterBroadcastControllerService } from '../controller/twitter-broardcast-controller.service'
import { TwitterBroadcastService } from '../data/twitter-broadcast.service'

@Injectable()
export class TwitterBroadcastCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterBroadcastCronService.name })

  protected cronTime = '30 */1 * * * *'
  // protected cronRunOnInit = true

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
    @Inject(TwitterBroadcastService)
    private readonly twitterBroadcastService: TwitterBroadcastService,
    @Inject(TwitterBroadcastControllerService)
    private readonly twitterBroadcastControllerService: TwitterBroadcastControllerService,
  ) {
    super()
    this.cronTime = this.configVarService.getString('TWITTER_CRON_BROADCAST_EXPRESSION') || this.cronTime
  }

  private get maxConcurrent() {
    return this.configVarService.getNumber('TWITTER_CRON_BROADCAST_MAX_CONCURRENT')
  }

  private get limit() {
    return this.configVarService.getNumber('TWITTER_CRON_BROADCAST_LIMIT')
  }

  protected async onTick() {
    this.checkBroadcasts()
  }

  private async checkBroadcasts() {
    try {
      const liveIds = await this.twitterBroadcastService.getManyLiveIds()
      await this.twitterBroadcastControllerService.fetchByIds(liveIds)
      if (this.limit <= 0) {
        return
      }

      const limit = Math.max(0, this.limit - liveIds.length)
      const activeIds = await this.twitterBroadcastService.getManyActive({ limit })
        .then((broadcasts) => broadcasts.map((broadcast) => broadcast.id))
      await this.twitterBroadcastControllerService.fetchByIds(activeIds)
    } catch (error) {
      this.logger.error(`checkBroadcasts: ${error.message}`)
    }
  }
}
