import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitterUserControllerService.name })

  private dbLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) { }

  public async getOneById(id: string, refresh = false) {
    let user = !refresh
      ? await this.twitterUserService.getOneById(id)
      : null
    if (!user) {
      user = await this.twitterApiService.getUserById(id).then((v) => this.saveUserV1(v))
    }
    return user
  }

  public async getOneByUsername(username: string, refresh = false) {
    let user = !refresh
      ? await this.twitterUserService.getOneByUsername(username)
      : null
    if (!user) {
      user = await this.twitterApiService.getUserByUsername(username).then((v) => this.saveUserV1(v))
    }
    return user
  }

  public async saveUser(result: any) {
    const id = result.rest_id

    const user = await this.dbLimiter.key(id).schedule(async () => {
      let tmpUser = await this.twitterUserService.getOneById(id)
      if (!tmpUser) {
        tmpUser = await this.twitterUserService.save(TwitterEntityUtil.buildUser(result))
      }
      return tmpUser
    })

    return user
  }

  public async saveUserV1(data: UserV1) {
    const user = await this.twitterUserService.save(TwitterEntityUtil.buildUserV1(data))
    return user
  }

  public async saveUsersV1(data: UserV1[]) {
    const users = await this.twitterUserService.saveAll(data.map((v) => TwitterEntityUtil.buildUserV1(v)))
    return users
  }

  public async saveUserV2(data: UserV2) {
    const user = await this.twitterUserService.save(TwitterEntityUtil.buildUserV2(data))
    return user
  }

  public async saveUsersV2(data: UserV2[]) {
    const users = await this.twitterUserService.saveAll(data.map((v) => TwitterEntityUtil.buildUserV2(v)))
    return users
  }
}
