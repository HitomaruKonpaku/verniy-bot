import { Inject, Injectable } from '@nestjs/common'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../../logger'
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
    const twitterUser = await this.twitterUserService.getOneById(id)
    if (!twitterUser || refresh) {
      const user = await this.twitterApiService.getUserById(id)
      await this.saveUser(user)
    }
    return twitterUser
  }

  public async getOneByUsername(id: string, refresh = false) {
    const twitterUser = await this.twitterUserService.getOneByUsername(id)
    if (!twitterUser || refresh) {
      const user = await this.twitterApiService.getUserByUsername(id)
      await this.saveUser(user)
    }
    return twitterUser
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
