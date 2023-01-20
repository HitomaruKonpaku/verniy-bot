import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SpaceV2CreatorLookupParams, UserV1 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { twitterSpaceLimiter, twitterSpacesByCreatorIdsLimiter, twitterSpacesByIdsLimiter, twitterUserLookupLimiter, twitterUserShowLimiter } from '../../twitter.limiter'
import { TwitterClientService } from './twitter-client.service'

@Injectable()
export class TwitterApiService {
  private readonly logger = baseLogger.child({ context: TwitterApiService.name })

  private readonly SPACE_LOOKUP_OPTIONS: Partial<SpaceV2CreatorLookupParams> = {
    expansions: ['creator_id', 'host_ids', 'speaker_ids'],
    'space.fields': ['id', 'created_at', 'updated_at', 'creator_id', 'state', 'is_ticketed', 'scheduled_start', 'started_at', 'ended_at', 'lang', 'title', 'host_ids', 'speaker_ids', 'invited_user_ids', 'participant_count'],
    'user.fields': ['id', 'created_at', 'username', 'name', 'protected', 'verified', 'profile_image_url'],
  }

  constructor(
    @Inject(TwitterClientService)
    private readonly twitterClientService: TwitterClientService,
  ) { }

  private get client() {
    return this.twitterClientService.roClient
  }

  public async getUserById(id: string): Promise<UserV1> {
    const requestId = randomUUID()
    try {
      return await twitterUserShowLimiter.schedule(async () => {
        this.logger.debug('--> getUserById', { requestId, id })
        const user = await this.client.v1.user({ user_id: id })
        this.logger.debug('<-- getUserById', { requestId })
        return user
      })
    } catch (error) {
      this.logger.error(`getUserById: ${error.message}`, { requestId, id })
      throw error
    }
  }

  public async getUserByUsername(username: string): Promise<UserV1> {
    const requestId = randomUUID()
    try {
      return await twitterUserShowLimiter.schedule(async () => {
        this.logger.debug('--> getUserByUsername', { requestId, username })
        const user = await this.client.v1.user({ screen_name: username })
        this.logger.debug('<-- getUserByUsername', { requestId })
        return user
      })
    } catch (error) {
      this.logger.error(`getUserByUsername: ${error.message}`, { requestId, username })
      throw error
    }
  }

  public async getAllUsersByUserIds(userIds: string[]): Promise<UserV1[]> {
    const chunks = ArrayUtils.splitIntoChunk(userIds, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(chunks.map((v) => this.getUsersByUserIds(v)))
    const users = results.filter((v) => v.status === 'fulfilled').flatMap((v: any) => v.value)
    return users
  }

  public async getUsersByUserIds(userIds: string[]): Promise<UserV1[]> {
    const requestId = randomUUID()
    try {
      return await twitterUserLookupLimiter.schedule(async () => {
        this.logger.debug('--> getUsersByUserIds', { requestId, userCount: userIds.length })
        const users = await this.client.v1.users({ user_id: userIds })
        this.logger.debug('<-- getUsersByUserIds', { requestId })
        return users
      })
    } catch (error) {
      this.logger.error(`getUsersByUserIds: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getAllUsersByUsernames(usernames: string[]): Promise<UserV1[]> {
    const chunks = ArrayUtils.splitIntoChunk(usernames, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(chunks.map((v) => this.getUsersByUsernames(v)))
    const users = results.filter((v) => v.status === 'fulfilled').flatMap((v: any) => v.value)
    return users
  }

  public async getUsersByUsernames(usernames: string[]): Promise<UserV1[]> {
    const requestId = randomUUID()
    try {
      return await twitterUserLookupLimiter.schedule(async () => {
        this.logger.debug('--> getUsersByUsernames', { requestId, userCount: usernames.length })
        const users = await this.client.v1.users({ screen_name: usernames })
        this.logger.debug('<-- getUsersByUsernames', { requestId })
        return users
      })
    } catch (error) {
      this.logger.error(`getUsersByUsernames: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getSpaceById(id: string) {
    const requestId = randomUUID()
    try {
      const result = await twitterSpaceLimiter.schedule(async () => {
        this.logger.debug('--> getSpaceById', { requestId, id })
        const response = await this.client.v2.space(
          id,
          this.SPACE_LOOKUP_OPTIONS,
        )
        this.logger.debug('<-- getSpaceById', { requestId })
        return Promise.resolve(response)
      })
      return result
    } catch (error) {
      this.logger.error(`getSpaceById: ${error.message}`, { requestId, id })
      throw error
    }
  }

  public async getSpacesByIds(ids: string[]) {
    const requestId = randomUUID()
    try {
      const result = await twitterSpacesByIdsLimiter.schedule(async () => {
        this.logger.debug('--> getSpacesByIds', { requestId, idCount: ids.length, ids })
        const response = await this.client.v2.spaces(
          ids,
          this.SPACE_LOOKUP_OPTIONS,
        )
        this.logger.debug('<-- getSpacesByIds', { requestId })
        return Promise.resolve(response)
      })
      return result
    } catch (error) {
      this.logger.error(`getSpacesByIds: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getSpacesByCreatorIds(userIds: string[]) {
    const requestId = randomUUID()
    try {
      const result = await twitterSpacesByCreatorIdsLimiter.schedule(async () => {
        this.logger.debug('--> getSpacesByCreatorIds', { requestId, userCount: userIds.length })
        const response = await this.client.v2.spacesByCreators(
          userIds,
          this.SPACE_LOOKUP_OPTIONS,
        )
        this.logger.debug('<-- getSpacesByCreatorIds', { requestId })
        return Promise.resolve(response)
      })
      return result
    } catch (error) {
      this.logger.error(`getSpacesByCreatorIds: ${error.message}`, { requestId })
      throw error
    }
  }
}
