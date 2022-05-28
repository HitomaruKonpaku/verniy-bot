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
    if (this.configService.twitcasting?.live?.active) {
      await this.twitCastingLiveTrackingService.start()
    }
    if (this.configService.twitcasting?.cron?.active) {
      this.twitCastingCronService.start()
    }
  }

  public async getDiscordChannelIds() {
    const result = await Promise.allSettled([
      this.trackTwitCastingLiveService.getDiscordChannelIds(),
    ])
    const ids = result
      .filter((v) => v.status === 'fulfilled')
      .map((v: any) => v.value as string[])
      .flat() || []
    return ids
  }
}
