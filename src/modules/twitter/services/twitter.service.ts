import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitterProfileTrackingService } from './twitter-profile-tracking.service'
import { TwitterTweetTrackingService } from './twitter-tweet-tracking.service'

@Injectable()
export class TwitterService {
  private readonly logger = baseLogger.child({ context: TwitterService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterTweetTrackingService)
    private readonly twitterTweetTrackingService: TwitterTweetTrackingService,
    @Inject(TwitterProfileTrackingService)
    private readonly twitterProfileTrackingService: TwitterProfileTrackingService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    if (this.configService.twitterTweetActive) {
      await this.twitterTweetTrackingService.start()
    }
    if (this.configService.twitterProfileActive) {
      await this.twitterProfileTrackingService.start()
    }
  }
}
