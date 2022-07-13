import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/services/base-cron.service'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITCH_API_LIST_SIZE } from '../../constants/twitch.constant'
import { TwitchUser } from '../../models/twitch-user.entity'
import { TwitchUserControllerService } from '../controller/twitch-user-controller.service'
import { TwitchUserService } from '../data/twitch-user.service'

@Injectable()
export class TwitchUserCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitchUserCronService.name })

  protected cronTime = '0 0 */1 * * *'

  constructor(
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TwitchUserControllerService)
    private readonly twitchUserControllerService: TwitchUserControllerService,
  ) {
    super()
  }

  protected async onTick() {
    await this.checkUsers()
  }

  private async checkUsers() {
    this.logger.info('--> checkUsers')
    const limiter = new Bottleneck({ maxConcurrent: 5 })
    try {
      const users = await this.twitchUserService.getAll()
      const chunks = ArrayUtils.splitIntoChunk(users, TWITCH_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((v) => limiter.schedule(() => this.getUserChunk(v))))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }

  private async getUserChunk(chunk: TwitchUser[]) {
    try {
      const ids = chunk.map((v) => v.id)
      await this.twitchUserControllerService.fetchUsersByIds(ids)
    } catch (error) {
      // Ignore
    }
  }
}
