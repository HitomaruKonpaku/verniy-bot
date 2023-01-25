import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitchUserCronService } from './twitch-user-cron.service'

@Injectable()
export class TwitchCronService {
  private readonly logger = baseLogger.child({ context: TwitchCronService.name })

  constructor(
    @Inject(TwitchUserCronService)
    private readonly twitchUserCronService: TwitchUserCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.twitchUserCronService.start()
  }
}
