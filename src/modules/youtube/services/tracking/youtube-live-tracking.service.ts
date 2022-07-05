import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/services/config.service'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackYoutubeLiveService } from '../../../track/services/track-youtube-live.service'

@Injectable()
export class YoutubeLiveTrackingService {
  private readonly logger = baseLogger.child({ context: YoutubeLiveTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackYoutubeLiveService)
    private readonly trackYoutubeLiveService: TrackYoutubeLiveService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
  }
}
