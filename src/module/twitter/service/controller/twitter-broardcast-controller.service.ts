import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { TwitterApi } from '../../api/twitter.api'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterBroadcastService } from '../data/twitter-broadcast.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterBroadcastControllerService {
  private readonly logger = baseLogger.child({ context: TwitterBroadcastControllerService.name })

  constructor(
    @Inject(TwitterBroadcastService)
    private readonly twitterBroadcastService: TwitterBroadcastService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApi)
    private readonly twitterApi: TwitterApi,
  ) { }

  public async getOneById(id: string) {
    let broadcast = await this.twitterBroadcastService.getOneById(id)
    if (!broadcast) {
      const data = await this.fetchByIds([id])
      broadcast = data.find((v) => v)
    }
    return broadcast
  }

  public async fetchByIds(ids: string[]) {
    try {
      const { data } = await this.twitterApi.broadcast.show(ids.filter((v) => v))
      const arr = Object.values(data.broadcasts)
      const dbLimiter = new Bottleneck({ maxConcurrent: 1 })
      const broadcasts = await Promise
        .all(arr.map((v) => dbLimiter.schedule(() => this.saveBroadcast(v))))
        .then((items) => items.filter((v) => v))
      return broadcasts
    } catch (error) {
      this.logger.error(`fetchByIds: ${error.message}`, { ids })
    }
    return []
  }

  public async saveBroadcast(data: any) {
    try {
      const broadcast = TwitterEntityUtil.buildBroadcast(data)
      await this.twitterBroadcastService.save(broadcast)
      return broadcast
    } catch (error) {
      this.logger.error(`saveBroadcast: ${error.message}`, { data })
    }
    return null
  }
}
