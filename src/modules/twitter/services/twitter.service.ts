import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitterCronService } from './twitter-cron.service'
import { TwitterProfileTrackingService } from './twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './twitter-space-tracking.service'
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
    @Inject(TwitterSpaceTrackingService)
    private readonly twitterSpaceTrackingService: TwitterSpaceTrackingService,
    @Inject(TwitterCronService)
    private readonly twitterCronService: TwitterCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    if (this.configService.twitter?.tweet?.active) {
      await this.twitterTweetTrackingService.start()
    }
    if (this.configService.twitter?.profile?.active) {
      await this.twitterProfileTrackingService.start()
    }
    if (this.configService.twitter?.space?.active) {
      await this.twitterSpaceTrackingService.start()
    }
    if (this.configService.twitter?.cron?.active) {
      this.twitterCronService.start()
    }
  }
}
