import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ArrayUtil } from '../../../../util/array.util'
import { TWITTER_API_LIST_SIZE } from '../../constant/twitter.constant'
import { TwitterUser } from '../../model/twitter-user.entity'
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
    try {
      const users = await this.twitterUserService.getManyForCheck()
      if (users.length) {
        // await this.updateUsersLegacy(users)
        await this.updateUsers(users)
      }
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }

  private async updateUsers(users: TwitterUser[]) {
    this.logger.debug('--> updateUsers', { userCount: users.length })
    const result = await Promise.allSettled(users.map(async (user) => {
      const newUser = await this.twitterUserControllerService.getUserByRestId(user.id)
      if (!newUser) {
        await this.twitterUserService.updateFields(user.id, { isActive: false, updatedAt: Date.now() })
      }
    }))
    const failedCount = result.filter((v) => v.status === 'rejected').length
    this.logger.debug('<-- updateUsers', { userCount: users.length, failedCount })
  }

  private async updateUsersLegacy(users: TwitterUser[]) {
    this.logger.debug('--> updateUsersLegacy', { userCount: users.length })
    const limiter = new Bottleneck({ maxConcurrent: 1 })
    const chunks = ArrayUtil.splitIntoChunk(users, TWITTER_API_LIST_SIZE)
    const result = await Promise.allSettled(chunks.map((v) => limiter.schedule(() => this.getUserChunk(v))))
    const failedCount = result.filter((v) => v.status === 'rejected').length
    this.logger.debug('<-- updateUsersLegacy', { userCount: users.length, failedCount })
  }

  private async getUserChunk(chunk: TwitterUser[]) {
    const ids = chunk.map((v) => v.id)
    const users = await this.twitterApiService.getUsersByUserIds(ids)
    const inactiveIdSet = new Set(ids)

    users.forEach((user) => {
      inactiveIdSet.delete(user.id_str)
      this.twitterUserControllerService
        .saveUserV1(user)
        .catch((error) => this.logger.error(`getUserChunk#saveUserV1: ${error.message}`, { id: user.id_str, user }))
    })

    inactiveIdSet.forEach((id) => {
      this.twitterUserService
        .updateFields(id, { isActive: false })
        .catch((error) => this.logger.error(`getUserChunk#updateFields: ${error.message}`, { id }))
    })
  }
}
