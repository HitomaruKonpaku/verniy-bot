import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { InstagramTrackingService } from './instagram-tracking.service'

@Injectable()
export class InstagramService {
  private readonly logger = baseLogger.child({ context: InstagramService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(InstagramTrackingService)
    private readonly instagramTrackingService: InstagramTrackingService,
  ) { }

  /**
   * @deprecated WIP/unstable, use at your own risk
   */
  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.instagram
    if (config.track) {
      await this.instagramTrackingService.start()
    }
  }
}
