import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitCastingLiveTrackingService } from './twitcasting-live-tracking.service'

@Injectable()
export class TwitCastingService {
  private readonly logger = baseLogger.child({ context: TwitCastingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitCastingLiveTrackingService)
    private readonly twitCastingLiveTrackingService: TwitCastingLiveTrackingService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.twitCastingLiveTrackingService.start()
  }
}
