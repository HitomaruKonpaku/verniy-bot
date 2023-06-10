import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeChannelCronService } from './youtube-channel-cron.service'

@Injectable()
export class YoutubeCronService {
  private readonly logger = baseLogger.child({ context: YoutubeCronService.name })

  constructor(
    @Inject(YoutubeChannelCronService)
    private readonly youtubeChannelCronService: YoutubeChannelCronService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.youtubeChannelCronService.start()
  }
}
