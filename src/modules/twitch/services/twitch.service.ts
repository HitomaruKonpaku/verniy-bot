import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitchLiveTrackingService } from './tracking/twitch-live-tracking.service'

@Injectable()
export class TwitchService {
  private readonly logger = baseLogger.child({ context: TwitchService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitchLiveTrackingService)
    private readonly twitchLiveTrackingService: TwitchLiveTrackingService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.twitch
    if (config.live?.active) {
      await this.twitchLiveTrackingService.start()
    }
    if (config.cron?.active) {
      // TODO
    }
  }
}
