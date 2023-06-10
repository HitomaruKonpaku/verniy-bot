import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { DiscordActivityCronService } from './discord-activity-cron.service'

@Injectable()
export class DiscordCronService {
  private readonly logger = baseLogger.child({ context: DiscordCronService.name })

  constructor(
    @Inject(DiscordActivityCronService)
    private readonly discordActivityCronService: DiscordActivityCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.discordActivityCronService.start()
  }
}
