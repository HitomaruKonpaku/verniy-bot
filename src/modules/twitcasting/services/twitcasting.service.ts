import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TrackTwitCastingLiveService } from '../../track/services/track-twitcasting-live.service'
import { TwitCastingLiveTrackingService } from './tracking/twitcasting-live-tracking.service'
import { TwitCastingCronService } from './twitcasting-cron.service'

@Injectable()
export class TwitCastingService {
  private readonly logger = baseLogger.child({ context: TwitCastingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitCastingLiveService)
    private readonly trackTwitCastingLiveService: TrackTwitCastingLiveService,
    @Inject(TwitCastingLiveTrackingService)
    private readonly twitCastingLiveTrackingService: TwitCastingLiveTrackingService,
    @Inject(TwitCastingCronService)
    private readonly twitCastingCronService: TwitCastingCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.twitcasting
    if (config.live?.active) {
      await this.twitCastingLiveTrackingService.start()
    }
    if (config.cron?.active) {
      this.twitCastingCronService.start()
    }
  }
}
