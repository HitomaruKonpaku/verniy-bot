import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { TwitterUser } from '../../model/twitter-user.entity'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterUserUtil } from '../../util/twitter-user.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterGraphqlUserService } from '../api/twitter-graphql-user.service'
import { TwitterUserService } from '../data/twitter-user.service'

interface GetOptions {
  fromDb?: boolean
}

@Injectable()
export class TwitterUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitterUserControllerService.name })

  private dbLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterGraphqlUserService)
    private readonly twitterGraphqlUserService: TwitterGraphqlUserService,
  ) { }

  public async getOneByRestId(id: string, options?: GetOptions) {
    let user: TwitterUser
    if (options?.fromDb) {
      user = await this.twitterUserService.getOneById(id)
    }

    if (!user) {
      const data = await this.twitterGraphqlUserService.getUserByRestId(id)
      const { result } = data.user
      if (!result?.rest_id) {
        return null
      }
      user = await this.saveUser(result)
    }

    return user
  }

  public async getOneByScreenName(screenName: string, options?: GetOptions) {
    let user: TwitterUser
    if (options?.fromDb) {
      user = await this.twitterUserService.getOneByUsername(screenName)
    }

    if (!user) {
      const data = await this.twitterGraphqlUserService.getUserByScreenName(screenName)
      const { result } = data.user
      if (!result?.rest_id) {
        return null
      }
      user = await this.saveUser(result)
    }

    return user
  }

  /**
   * @deprecated
   */
  public async getOneById(id: string, refresh = false) {
    let user = !refresh
      ? await this.twitterUserService.getOneById(id)
      : null
    if (!user) {
      user = await this.twitterApiService.getUserById(id).then((v) => this.saveUserV1(v))
    }
    return user
  }

  /**
   * @deprecated
   */
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
    const user = await this.dbLimiter.key(id).schedule(() => this.twitterUserService.save(TwitterEntityUtil.buildUser(result)))
    user.organizationId = await this.saveOrganizationId(result.affiliates_highlighted_label?.label, user.id)
    return user
  }

  public async patchUser(result: any) {
    const id = result.rest_id
    const user = await this.dbLimiter.key(id).schedule(async () => {
      let tmpUser = await this.twitterUserService.getOneByIdWithoutTrack(id)
      if (!tmpUser) {
        tmpUser = await this.twitterUserService.save(TwitterEntityUtil.buildUser(result))
      }
      return tmpUser
    })
    return user
  }

  public async saveOrganizationId(label: any, sourceUserId: string) {
    try {
      if (!label) {
        await this.twitterUserService.updateFields(sourceUserId, { organizationId: null })
        return null
      }
      const username = TwitterUserUtil.parseUsername(label.url.url)
      let user = await this.twitterUserService.getOneByUsername(username)
      if (!user) {
        user = await this.getOneByScreenName(username)
      }
      const organizationId = user.id
      await this.twitterUserService.updateFields(sourceUserId, { organizationId })
      return organizationId
    } catch (error) {
      this.logger.error(`saveOrganizationId: ${error.message}`, label)
    }
    return null
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
