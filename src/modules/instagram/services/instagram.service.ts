import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { InstagramPostTrackingService } from './tracking/instagram-post-tracking.service'
import { InstagramProfileTrackingService } from './tracking/instagram-profile-tracking.service'
import { InstagramStoryTrackingService } from './tracking/instagram-story-tracking.service'
import { InstagramTrackingService } from './tracking/instagram-tracking.service'

@Injectable()
export class InstagramService {
  private readonly logger = baseLogger.child({ context: InstagramService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(InstagramTrackingService)
    private readonly instagramTrackingService: InstagramTrackingService,
    @Inject(InstagramPostTrackingService)
    private readonly instagramPostTrackingService: InstagramPostTrackingService,
    @Inject(InstagramStoryTrackingService)
    private readonly instagramStoryTrackingService: InstagramStoryTrackingService,
    @Inject(InstagramProfileTrackingService)
    private readonly instagramProfileTrackingService: InstagramProfileTrackingService,
  ) { }

  /**
   * @deprecated WIP/unstable, use at your own risk
   */
  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.instagram
    if (config.track.active) {
      this.instagramPostTrackingService.start()
      this.instagramStoryTrackingService.start()
      this.instagramProfileTrackingService.start()
      this.instagramTrackingService.start()
    }
  }
}
