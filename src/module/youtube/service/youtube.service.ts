import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { YoutubeCronService } from './cron/youtube-cron.service'
import { YoutubeLiveTrackingService } from './tracking/youtube-live-tracking.service'

@Injectable()
export class YoutubeService {
  private readonly logger = baseLogger.child({ context: YoutubeService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(YoutubeLiveTrackingService)
    private readonly youtubeLiveTrackingService: YoutubeLiveTrackingService,
    @Inject(YoutubeCronService)
    private readonly youtubeCronService: YoutubeCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.youtube
    if (config.live?.active) {
      this.youtubeLiveTrackingService.start()
    }
    if (config.cron?.active) {
      this.youtubeCronService.start()
    }
  }
}
