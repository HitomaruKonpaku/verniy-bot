import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { TwitchCronService } from './cron/twitch-cron.service'
import { TwitchChatTrackingService } from './tracking/twitch-chat-tracking.service'
import { TwitchLiveTrackingService } from './tracking/twitch-live-tracking.service'

@Injectable()
export class TwitchService {
  private readonly logger = baseLogger.child({ context: TwitchService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitchLiveTrackingService)
    private readonly twitchLiveTrackingService: TwitchLiveTrackingService,
    @Inject(TwitchChatTrackingService)
    private readonly twitchChatTrackingService: TwitchChatTrackingService,
    @Inject(TwitchCronService)
    private readonly twitchCronService: TwitchCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    const config = this.configService.twitch
    if (config.live?.active) {
      await this.twitchLiveTrackingService.start()
    }
    if (config.chat?.active) {
      await this.twitchChatTrackingService.start()
    }
    if (config.cron?.active) {
      this.twitchCronService.start()
    }
  }
}
