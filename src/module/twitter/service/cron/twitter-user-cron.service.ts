import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { TwitterUser } from '../../model/twitter-user.entity'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterUserCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  private maxConcurrent = 1
  private limit = 20

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) {
    super()
  }

  protected async onTick() {
    this.logger.debug('onTick')
    this.checkUsers()
  }

  private async getUsers() {
    const users = await this.twitterUserService.getManyForCheck({ limit: this.limit })
    return users
  }

  private async checkUsers() {
    try {
      const users = await this.getUsers()
      this.logger.debug('checkUsers', { userCount: users.length })
      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(users.map((v) => limiter.schedule(() => this.checkUser(v))))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
  }

  private async checkUser(user: TwitterUser) {
    try {
      const newUser = await this.twitterUserControllerService.getOneByRestId(user.id)
      if (newUser) {
        return
      }
      await this.twitterUserService.updateFields(
        user.id,
        {
          isActive: false,
          updatedAt: Date.now(),
        },
      )
    } catch (error) {
      this.logger.error(`checkUser: ${error.message}`, { id: user.id })
    }
  }
}
