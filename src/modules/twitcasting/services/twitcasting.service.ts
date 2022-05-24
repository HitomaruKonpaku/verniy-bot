import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingCronService } from './twitcasting-cron.service'
import { TwitCastingLiveTrackingService } from './twitcasting-live-tracking.service'

@Injectable()
export class TwitCastingService {
  private readonly logger = baseLogger.child({ context: TwitCastingService.name })

  constructor(
    @Inject(TwitCastingLiveTrackingService)
    private readonly twitCastingLiveTrackingService: TwitCastingLiveTrackingService,
    @Inject(TwitCastingCronService)
    private readonly twitCastingCronService: TwitCastingCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.twitCastingLiveTrackingService.start()
    this.twitCastingCronService.start()
  }
}
