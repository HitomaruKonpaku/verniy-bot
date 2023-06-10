import { Inject, Injectable, forwardRef } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../logger'
import { BaseCronService } from '../../../shared/service/base-cron.service'
import { DiscordGuildService } from '../service/data/discord-guild.service'
import { DiscordClientService } from '../service/discord-client.service'
import { DiscordDbService } from '../service/discord-db.service'

@Injectable()
export class DiscordGuildCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: DiscordGuildCronService.name })

  protected cronTime = '0 0 */1 * * *'

  private limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000,
  })

  constructor(
    @Inject(forwardRef(() => DiscordClientService))
    private readonly client: DiscordClientService,
    @Inject(DiscordDbService)
    private readonly discordDbService: DiscordDbService,
    @Inject(DiscordGuildService)
    private readonly discordGuildService: DiscordGuildService,
  ) {
    super()
  }

  protected async onTick() {
    this.logger.debug('--> onTick')
    try {
      const guilds = await this.discordGuildService.getManyForCron()
      await Promise.allSettled(guilds.map((v) => this.limiter.schedule(() => this.updateGuild(v.id))))
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }
    this.logger.debug('<-- onTick')
  }

  private async updateGuild(id: string) {
    try {
      const guild = await this.client.guilds.fetch(id)
      await this.discordDbService.saveGuild(guild)
    } catch (error) {
      // Unknown Guild
      if (error.code === 10004) {
        await this.discordGuildService.updateFields(
          id,
          {
            isActive: false,
            updatedAt: Date.now(),
          },
        )
        return
      }
      this.logger.error(`updateGuild: ${error.message}`, { id })
    }
  }
}
