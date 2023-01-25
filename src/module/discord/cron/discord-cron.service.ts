import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { ActivityType } from 'discord.js'
import { CRON_TIME_ZONE } from '../../../constant/cron.constant'
import { baseLogger } from '../../../logger'
import { DiscordClientService } from '../service/discord-client.service'

@Injectable()
export class DiscordCronService {
  private readonly logger = baseLogger.child({ context: DiscordCronService.name })

  private cronJob: CronJob

  constructor(
    @Inject(DiscordClientService)
    private readonly client: DiscordClientService,
  ) {
    this.client.once('ready', () => this.start())
  }

  public async start() {
    this.logger.info('Starting...')
    this.cronJob = new CronJob('0 */1 * * * *', () => this.onTick(), null, false, CRON_TIME_ZONE, this, true)
    this.cronJob.start()
  }

  private async onTick() {
    try {
      const guildCount = await this.getGuildCount()
      const name = `${guildCount} servers`
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
