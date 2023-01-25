import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { TiktokTrackingService } from './tiktok-tracking.service'

@Injectable()
export class TiktokService {
  private readonly logger = baseLogger.child({ context: TiktokService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TiktokTrackingService)
    private readonly tiktokTrackingService: TiktokTrackingService,
  ) { }

  /**
   * @deprecated WIP/unstable, use at your own risk
   */
  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.tiktok
    if (config.track.active) {
      await this.tiktokTrackingService.start()
    }
  }
}
