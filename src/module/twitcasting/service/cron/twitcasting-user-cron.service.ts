import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { TwitCastingUserControllerService } from '../controller/twitcasting-user-controller.service'
import { TwitCastingUserService } from '../data/twitcasting-user.service'

@Injectable()
export class TwitCastingUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitCastingUserCronService.name })

  protected cronTime = '0 */1 * * * *'

  private limit = 20

  constructor(
    @Inject(TwitCastingUserService)
    private readonly twitCastingUserService: TwitCastingUserService,
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
  ) {
    super()
  }

  protected async onTick() {
    this.logger.debug('onTick')
    await this.checkUsers()
  }

  private async checkUsers() {
    try {
      const users = await this.twitCastingUserService.getManyActive({ limit: this.limit })
      await Promise.allSettled(users.map((v) => this.getUser(v.id)))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
  }

  private async getUser(id: string) {
    try {
      await this.twitCastingUserControllerService.getOneAndSaveById(id)
    } catch (error) {
      if (error.response?.status === 404) {
        await this.deactive(id)
      }
    }
  }

  private async deactive(id: string) {
    try {
      await this.twitCastingUserService.updateFields(id, {
        isActive: false,
        updatedAt: Date.now(),
      })
    } catch (error) {
      this.logger.error(`deactive: ${error.message}`, { id })
    }
  }
}
