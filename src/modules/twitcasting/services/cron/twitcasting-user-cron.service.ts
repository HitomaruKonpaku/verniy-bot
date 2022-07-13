import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/services/base-cron.service'
import { TwitCastingUserControllerService } from '../controller/twitcasting-user-controller.service'
import { TwitCastingUserService } from '../data/twitcasting-user.service'

@Injectable()
export class TwitCastingUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitCastingUserCronService.name })

  protected cronTime = '0 0 */3 * * *'

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) {
    super()
  }

  protected async onTick() {
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
