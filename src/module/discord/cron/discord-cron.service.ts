import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { DiscordActivityCronService } from './discord-activity-cron.service'
import { DiscordGuildCronService } from './discord-guild-cron.service'
import { DiscordUserCronService } from './discord-user-cron.service'

@Injectable()
export class DiscordCronService {
  private readonly logger = baseLogger.child({ context: DiscordCronService.name })

  constructor(
    @Inject(DiscordActivityCronService)
    private readonly discordActivityCronService: DiscordActivityCronService,
    @Inject(DiscordUserCronService)
    private readonly discordUserCronService: DiscordUserCronService,
    @Inject(DiscordGuildCronService)
    private readonly discordGuildCronService: DiscordGuildCronService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.discordActivityCronService.start()
    this.discordUserCronService.start()
    this.discordGuildCronService.start()
  }
}
