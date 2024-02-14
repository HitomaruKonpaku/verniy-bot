import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { UserV1, UserV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { BooleanUtil } from '../../../../util/boolean.util'
import { HistoryService } from '../../../history/service/history.service'
import { TwitterApiOptions } from '../../api/interface/twitter-api.interface'
import { TwitterUser } from '../../model/twitter-user.entity'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterUserUtil } from '../../util/twitter-user.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterGraphqlUserService } from '../api/twitter-graphql-user.service'
import { TwitterUserService } from '../data/twitter-user.service'

interface GetOptions extends TwitterApiOptions {
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
    @Inject(HistoryService)
    private readonly historyService: HistoryService,
  ) { }

  public async getOneByRestId(id: string, options?: GetOptions) {
    let user: TwitterUser
    if (options?.fromDb) {
      user = await this.twitterUserService.getOneById(id)
    }

    if (!user) {
      const data = await this.twitterGraphqlUserService.getUserByRestId(id)
      const result = data?.user?.result
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
      const data = await this.twitterGraphqlUserService.getUserByScreenName(screenName, options)
      const result = data?.user?.result
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
    const user = await this.dbLimiter.key(id).schedule(() => this.save(TwitterEntityUtil.buildUser(result)))
    user.organizationId = await this.saveOrganizationId(result.affiliates_highlighted_label?.label, user.id)
    return user
  }

  public async patchUser(result: any) {
    const id = result.rest_id
    const user = await this.dbLimiter.key(id).schedule(async () => {
      let tmpUser = await this.twitterUserService.getOneByIdWithoutTrack(id)
      if (!tmpUser) {
        tmpUser = await this.save(TwitterEntityUtil.buildUser(result))
      }
      return tmpUser
    })
    return user
  }

  public async saveOrganizationId(label: any, sourceUserId: string) {
    try {
      if (!label || !label.url) {
        await this.twitterUserService.updateFields(sourceUserId, {
          updatedAt: Date.now(),
          organizationId: null,
        })
        return null
      }
      const username = TwitterUserUtil.parseUsername(label.url.url)
      let user = await this.twitterUserService.getOneByUsername(username)
      if (!user) {
        user = await this.getOneByScreenName(username)
      }
      const organizationId = user.id
      await this.twitterUserService.updateFields(sourceUserId, {
        updatedAt: Date.now(),
        organizationId,
      })
      return organizationId
    } catch (error) {
      this.logger.error(`saveOrganizationId: ${error.message}`, { userId: sourceUserId, label })
    }
    return null
  }

  public async saveUserV1(data: UserV1) {
    const user = await this.save(TwitterEntityUtil.buildUserV1(data))
    return user
  }

  public async saveUsersV1(data: UserV1[]) {
    const users = await this.twitterUserService.saveAll(data.map((v) => TwitterEntityUtil.buildUserV1(v)))
    return users
  }

  public async saveUserV2(data: UserV2) {
    const user = await this.save(TwitterEntityUtil.buildUserV2(data))
    return user
  }

  public async saveUsersV2(data: UserV2[]) {
    const users = await this.twitterUserService.saveAll(data.map((v) => TwitterEntityUtil.buildUserV2(v)))
    return users
  }

  private async save(data: TwitterUser) {
    const oldUser = await this.twitterUserService.getOneById(data.id)
    const newUser = await this.twitterUserService.save(data)
    this.saveHistory(oldUser, newUser)
    return newUser
  }

  private async saveHistory(oldUser: TwitterUser, newUser: TwitterUser) {
    if (!oldUser) {
      return
    }

    const entity = 'twitter_user'

    let fields = ['isActive', 'protected', 'verified']
    await Promise.allSettled(fields.map(async (field) => {
      if (oldUser[field] === newUser[field]) {
        return
      }

      await this.historyService.saveBoolean({
        entity,
        entityId: newUser.id,
        field,
        oldValue: BooleanUtil.toNumberStr(oldUser[field]),
        newValue: BooleanUtil.toNumberStr(newUser[field]),
      })
    }))

    fields = ['username', 'name', 'location', 'description', 'profileImageUrl', 'profileBannerUrl']
    await Promise.allSettled(fields.map(async (field) => {
      if (oldUser[field] === newUser[field]) {
        return
      }

      await this.historyService.saveString({
        entity,
        entityId: newUser.id,
        field,
        oldValue: oldUser[field],
        newValue: newUser[field],
      })
    }))
  }
}
