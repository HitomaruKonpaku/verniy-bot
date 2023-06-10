import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { ActivityType } from 'discord.js'
import { baseLogger } from '../../../logger'
import { BaseCronService } from '../../../shared/service/base-cron.service'
import { DiscordClientService } from '../service/discord-client.service'

@Injectable()
export class DiscordActivityCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: DiscordActivityCronService.name })

  protected cronTime = '0 */1 * * * *'
  protected cronRunOnInit = true

  constructor(
    @Inject(forwardRef(() => DiscordClientService))
    private readonly client: DiscordClientService,
  ) {
    super()
  }

  protected async onTick() {
    try {
      const count = await this.getGuildCount()
      const name = `${count} servers`
      this.client.user.setActivity({ name, type: ActivityType.Watching })
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }
  }

  /**
   * @see https://discordjs.guide/sharding/#fetchclientvalues
   */
  private async getGuildCount() {
    // const counts = await this.client.shard.fetchClientValues('guilds.cache.size') as number[]
    // const sum = counts.reduce((pv, cv) => pv + cv, 0)
    const sum = this.client.guilds.cache.size
    return sum
  }
}
