import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { HolodexSpaceCronService } from './cron/holodex-space-cron.service'
import { HolodexTweetTrackingService } from './tracking/holodex-tweet-tracking.service'

@Injectable()
export class HolodexService {
  private readonly logger = baseLogger.child({ context: HolodexService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(HolodexTweetTrackingService)
    private readonly holodexTweetTrackingService: HolodexTweetTrackingService,
    @Inject(HolodexSpaceCronService)
    private readonly holodexSpaceCronService: HolodexSpaceCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.holodex
    if (config.tweet?.active) {
      const twitterConfig = this.configService.twitter
      if (twitterConfig.active && twitterConfig.tweet?.active) {
        this.holodexTweetTrackingService.start()
      }
    }
    if (config.space?.active) {
      this.holodexSpaceCronService.start()
    }
  }
}
