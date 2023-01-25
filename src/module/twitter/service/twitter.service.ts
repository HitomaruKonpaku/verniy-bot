import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { TwitterCronService } from './cron/twitter-cron.service'
import { TwitterProfileTrackingService } from './tracking/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './tracking/twitter-space-tracking.service'
import { TwitterTweetTrackingService } from './tracking/twitter-tweet-tracking.service'

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
    const config = this.configService.twitter
    if (config.tweet?.active) {
      await this.twitterTweetTrackingService.start()
    }
    if (config.profile?.active) {
      await this.twitterProfileTrackingService.start()
    }
    if (config.space?.active) {
      await this.twitterSpaceTrackingService.start()
    }
    if (config.cron?.active) {
      this.twitterCronService.start()
    }
  }
}
