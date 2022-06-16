import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitchStreamTrackingService } from './tracking/twitch-stream-tracking.service'

@Injectable()
export class TwitchService {
  private readonly logger = baseLogger.child({ context: TwitchService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitchStreamTrackingService)
    private readonly twitchStreamTrackingService: TwitchStreamTrackingService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.twitch
    if (config.live?.active) {
      await this.twitchStreamTrackingService.start()
    }
    if (config.cron?.active) {
      // TODO
    }
  }
}
