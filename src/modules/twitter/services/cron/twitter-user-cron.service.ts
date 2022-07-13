import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/services/base-cron.service'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { TwitterUser } from '../../models/twitter-user.entity'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterUserCronService.name })

  protected cronTime = '0 0 */6 * * *'

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) {
    super()
  }

  protected async onTick() {
    await this.checkUsers()
  }

  private async checkUsers() {
    this.logger.info('--> checkUsers')
    const limiter = new Bottleneck({ maxConcurrent: 1 })
    try {
      const users = await this.twitterUserService.getManyForCheck()
      const chunks = ArrayUtils.splitIntoChunk(users, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => limiter.schedule(() => this.getUserChunk(v))))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }

  private async getUserChunk(chunk: TwitterUser[]) {
    try {
      const ids = chunk.map((v) => v.id)
      const users = await this.twitterApiService.getUsersByUserIds(ids)
      const inactiveIdSet = new Set(ids)

      users.forEach((user) => {
        inactiveIdSet.delete(user.id_str)
        this.twitterUserControllerService
          .saveUser(user)
          .catch((error) => this.logger.error(`getUserChunk#updateByUserObject: ${error.message}`, { id: user.id_str, user }))
      })

      inactiveIdSet.forEach((id) => {
        this.twitterUserService
          .updateIsActive(id, false)
          .catch((error) => this.logger.error(`getUserChunk#updateIsActive: ${error.message}`, { id }))
      })
    } catch (error) {
      // Ignore
    }
  }
}
