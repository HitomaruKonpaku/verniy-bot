import { Inject, Injectable } from '@nestjs/common'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { TwitterEntityUtils } from '../../utils/twitter-entity.utils'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitterUserControllerService.name })

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
      user = await this.twitterApiService.getUserById(id).then((v) => this.saveUser(v))
    }
    return user
  }

  public async getOneByUsername(username: string, refresh = false) {
    let user = !refresh
      ? await this.twitterUserService.getOneByUsername(username)
      : null
    if (!user) {
      user = await this.twitterApiService.getUserByUsername(username).then((v) => this.saveUser(v))
    }
    return user
  }

  public async saveUser(data: UserV1) {
    const user = await this.twitterUserService.save(TwitterEntityUtils.buildUser(data))
    return user
  }

  public async saveUserV2(data: UserV2) {
    const user = await this.twitterUserService.save(TwitterEntityUtils.buildUserV2(data))
    return user
  }
}
