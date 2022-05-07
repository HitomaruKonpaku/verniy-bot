import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitterProfileService } from './twitter-profile.service'
import { TwitterTweetService } from './twitter-tweet.service'

@Injectable()
export class TwitterService {
  private readonly logger = baseLogger.child({ context: TwitterService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterProfileService)
    private readonly twitterProfileService: TwitterProfileService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    if (this.configService.twitterTweetActive) {
      await this.twitterTweetService.start()
    }
    if (this.configService.twitterProfileActive) {
      await this.twitterProfileService.start()
    }
  }
}
