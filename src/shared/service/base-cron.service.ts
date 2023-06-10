import { CronJob } from 'cron'
import winston from 'winston'
import { CRON_TIME_ZONE } from '../../constant/cron.constant'

export abstract class BaseCronService {
  protected readonly abstract logger: winston.Logger

  protected cronTime = '0 0 */1 * * *'
  protected cronTimeZone = CRON_TIME_ZONE
  protected cronStartNow = false
  protected cronRunOnInit = false

  protected cronJob: CronJob

  protected abstract onTick(): void | Promise<void>

  public start() {
    this.logger.info('Starting...')
    this.initCronJob()
    this.cronJob.start()
  }

  private initCronJob() {
    this.cronJob = new CronJob(
      this.cronTime,
      () => this.onTick(),
      null,
      this.cronStartNow,
      this.cronTimeZone,
      null,
      this.cronRunOnInit,
    )
  }
}
