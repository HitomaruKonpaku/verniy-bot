import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { SpaceV2 } from 'twitter-api-v2'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TrackTwitterSpaceService } from '../../database/services/track-twitter-space.service'
import { TwitterSpaceService } from '../../database/services/twitter-space.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { twitterSpacesByCreatorIdsLimiter, twitterSpacesByIdsLimiter } from '../twitter.limiter'
import { TwitterApiService } from './twitter-api.service'

@Injectable()
export class TwitterSpaceTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitterSpaceService)
    private readonly trackTwitterSpaceService: TrackTwitterSpaceService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.execute()
  }

  private async execute() {
    try {
      const userIds = await this.trackTwitterSpaceService.getTwitterUserIds()
      if (userIds.length) {
        const chunks = Utils.splitArrayIntoChunk(userIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.getSpacesByUserIds(v)))
      }

      const spaceIds = await this.twitterSpaceService.getLiveSpaceIds()
      if (spaceIds.length) {
        const chunks = Utils.splitArrayIntoChunk(spaceIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.getSpacesByIds(v)))
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const { interval } = this.configService.twitter.space
    setTimeout(() => this.execute(), interval)
  }

  private async getSpacesByIds(ids: string[]) {
    try {
      // eslint-disable-next-line max-len
      const result = await twitterSpacesByIdsLimiter.schedule(() => this.twitterApiService.getSpacesByIds(ids))
      const spaces = result.data || []
      await Promise.allSettled(spaces.map((space) => this.updateSpace(space)))
    } catch (error) {
      this.logger.error(`getSpacesByIds: ${error.message}`)
    }
  }

  private async getSpacesByUserIds(userIds: string[]) {
    try {
      // eslint-disable-next-line max-len
      const result = await twitterSpacesByCreatorIdsLimiter.schedule(() => this.twitterApiService.getSpacesByCreatorIds(userIds))
      const spaces = result.data || []
      await Promise.allSettled(spaces.map((space) => this.updateSpace(space)))
    } catch (error) {
      this.logger.error(`getSpacesByUserIds: ${error.message}`)
    }
  }

  private async updateSpace(space: SpaceV2) {
    try {
      await this.twitterSpaceService.updateByTwitterUser(space)
    } catch (error) {
      this.logger.error(`updateSpace: ${error.message}`, { space })
    }
  }
}
