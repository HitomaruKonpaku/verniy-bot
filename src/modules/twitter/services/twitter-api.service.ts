import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { UserV1 } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterClientService } from './twitter-client.service'

@Injectable()
export class TwitterApiService {
  private readonly logger = baseLogger.child({ context: TwitterApiService.name })

  constructor(
    @Inject(TwitterClientService)
    private readonly twitterClientService: TwitterClientService,
  ) { }

  private get client() {
    return this.twitterClientService.roClient
  }

  public async getAllUsersByUserIds(userIds: string[]): Promise<UserV1[]> {
    if (!userIds?.length) {
      return []
    }
    const chunks = Utils.splitArrayIntoChunk(userIds, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(chunks.map((v) => this.getUsersByUserIds(v)))
    const users = results.filter((v) => v.status === 'fulfilled').flatMap((v: any) => v.value)
    return users
  }

  public async getUsersByUserIds(userIds: string[]): Promise<UserV1[]> {
    if (!userIds?.length) {
      return []
    }
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getUsersByUserIds', { requestId, userCount: userIds.length, userIds })
      const users = await this.client.v1.users({ user_id: userIds })
      this.logger.debug('<-- getUsersByUserIds', { requestId })
      return users
    } catch (error) {
      this.logger.error(`getUsersByUserIds: ${error.message}`, { requestId })
    }
    return []
  }

  public async getAllUsersByUsernames(usernames: string[]): Promise<UserV1[]> {
    if (!usernames?.length) {
      return []
    }
    const chunks = Utils.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(chunks.map((v) => this.getUsersByUsernames(v)))
    const users = results.filter((v) => v.status === 'fulfilled').flatMap((v: any) => v.value)
    return users
  }

  public async getUsersByUsernames(usernames: string[]): Promise<UserV1[]> {
    if (!usernames?.length) {
      return []
    }
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getUsersByUsernames', { requestId, userCount: usernames.length, usernames })
      const users = await this.client.v1.users({ screen_name: usernames })
      this.logger.debug('<-- getUsersByUsernames', { requestId })
      return users
    } catch (error) {
      this.logger.error(`getUsersByUsernames: ${error.message}`, { requestId })
    }
    return []
  }

  public async getUserByUsername(username: string): Promise<UserV1> {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getUserByUsername', { requestId, username })
      const user = await this.client.v1.user({ screen_name: username })
      this.logger.debug('<-- getUserByUsername', { requestId })
      return user
    } catch (error) {
      this.logger.error(`getUserByUsername: ${error.message}`, { requestId })
      throw error
    }
  }
}
