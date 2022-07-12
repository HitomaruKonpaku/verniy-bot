import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { CRON_TIME_ZONE } from '../../../../constants/cron.constant'
import { baseLogger } from '../../../../logger'
import { TwitCastingUserControllerService } from '../controller/twitcasting-user-controller.service'
import { TwitCastingUserService } from '../data/twitcasting-user.service'

@Injectable()
export class TwitCastingUserCronService {
  private readonly logger = baseLogger.child({ context: TwitCastingUserCronService.name })

  private readonly CRON_TIME = '0 0 */3 * * *'

  private cronJob: CronJob

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.initCron()
    this.cronJob.start()
  }

  private initCron() {
    this.cronJob = new CronJob(
      this.CRON_TIME,
      () => this.onTick(),
      null,
      false,
      CRON_TIME_ZONE,
    )
  }

  private async onTick() {
    await this.checkUsers()
  }

  private async checkUsers() {
    this.logger.debug('--> checkUsers')
    try {
      const users = await this.twitCastingUserService.getManyActive()
      await Promise.allSettled(users.map((v) => this.twitCastingUserControllerService.getOneAndSaveById(v.id)))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.debug('<-- checkUsers')
  }
}
