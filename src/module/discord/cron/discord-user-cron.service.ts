import { Inject, Injectable, forwardRef } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../logger'
import { BaseCronService } from '../../../shared/service/base-cron.service'
import { DiscordUserService } from '../service/data/discord-user.service'
import { DiscordClientService } from '../service/discord-client.service'
import { DiscordDbService } from '../service/discord-db.service'

@Injectable()
export class DiscordUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: DiscordUserCronService.name })

  protected cronTime = '0 30 */1 * * *'

  private limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000,
  })

  constructor(
    @Inject(forwardRef(() => DiscordClientService))
    private readonly client: DiscordClientService,
    @Inject(DiscordDbService)
    private readonly discordDbService: DiscordDbService,
    @Inject(DiscordUserService)
    private readonly discordUserService: DiscordUserService,
  ) {
    super()
  }

  protected async onTick() {
    this.logger.debug('--> onTick')
    try {
      const users = await this.discordUserService.getManyForCron()
      await Promise.allSettled(users.map((v) => this.limiter.schedule(() => this.updateUser(v.id))))
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }
    this.logger.debug('<-- onTick')
  }

  private async updateUser(id: string) {
    try {
      const user = await this.client.users.fetch(id)
      await this.discordDbService.saveUser(user)
    } catch (error) {
      this.logger.error(`updateUser: ${error.message}`, { id })
    }
  }
}
