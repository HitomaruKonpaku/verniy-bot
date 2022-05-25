import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { CRON_TIME_ZONE } from '../../../constants/cron.constant'
import { logger as baseLogger } from '../../../logger'
import { TwitCastingUserControlService } from './control/twitcasting-user-control.service'
import { TwitCastingUserService } from './data/twitcasting-user.service'

@Injectable()
export class TwitCastingCronService {
  private readonly logger = baseLogger.child({ context: TwitCastingCronService.name })

  private userCheckCronJob: CronJob

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControlService)
    private readonly twitCastingUserControlService: TwitCastingUserControlService,
  ) {
    const cronTimeZone = CRON_TIME_ZONE
    this.userCheckCronJob = new CronJob('0 0 */3 * * *', () => this.checkUsers(), null, false, cronTimeZone)
  }

  public async start() {
    this.logger.info('Starting...')
    this.userCheckCronJob.start()
  }

  public async checkUsers() {
    this.logger.info('--> checkUsers')
    try {
      const users = await this.twitCastingUserService.getManyActive()
      // eslint-disable-next-line max-len
      await Promise.allSettled(users.map((v) => this.twitCastingUserControlService.getOneAndSaveById(v.id)))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }
}
