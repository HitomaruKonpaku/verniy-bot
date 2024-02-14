import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { ConfigService } from '../../../config/service/config.service'
import { TwitterApiOptions } from '../../api/interface/twitter-api.interface'
import { TwitterUser } from '../../model/twitter-user.entity'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterUserService } from '../data/twitter-user.service'

interface GetOptions {
  limit?: number
}

@Injectable()
export class TwitterUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterUserCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    super()
    this.cronTime = this.configVarService.getString('TWITTER_CRON_USER_EXPRESSION')
  }

  private get maxConcurrent() {
    return this.configVarService.getNumber('TWITTER_CRON_USER_MAX_CONCURRENT')
  }

  private get limit() {
    return this.configVarService.getNumber('TWITTER_CRON_USER_LIMIT')
  }

  protected async onTick() {
    await this.checkUsers()
    await this.checkUsers({ usePublic: true })
  }

  private async getUsers(opts?: GetOptions) {
    const config = this.configService.twitter
    const joinTrack = config.profile?.active
    const users = await this.twitterUserService.getManyForCheck({ limit: opts?.limit || 0, joinTrack })
    return users
  }

  private async checkUsers(opts?: TwitterApiOptions) {
    try {
      if (this.limit <= 0) {
        return
      }

      const users = await this.getUsers({ limit: this.limit })
      this.logger.debug('checkUsers', { userCount: users.length, ...opts })
      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(users.map((v) => limiter.schedule(() => this.checkUser(v, opts))))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
  }

  private async checkUser(user: TwitterUser, opts?: TwitterApiOptions) {
    try {
      const newUser = !opts?.usePublic
        ? await this.twitterUserControllerService.getOneByRestId(user.id)
        : await this.twitterUserControllerService.getOneByScreenName(user.username, opts)
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
      this.logger.error(`checkUser: ${error.message}`, { id: user.id, ...opts })
    }
  }
}
