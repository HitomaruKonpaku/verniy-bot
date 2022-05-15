import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TwitterSpace } from '../../database/models/twitter-space.entity'
import { TwitterSpaceService } from '../../database/services/twitter-space.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { twitterSpacesByIdsLimiter } from '../twitter.limiter'
import { TwitterApiService } from './twitter-api.service'
import { TwitterProfileTrackingService } from './twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './twitter-space-tracking.service'
import { TwitterTweetTrackingService } from './twitter-tweet-tracking.service'

@Injectable()
export class TwitterService {
  private readonly logger = baseLogger.child({ context: TwitterService.name })

  private spaceCheckInterval = 1000 * 60 * 60 * 12

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterTweetTrackingService)
    private readonly twitterTweetTrackingService: TwitterTweetTrackingService,
    @Inject(TwitterProfileTrackingService)
    private readonly twitterProfileTrackingService: TwitterProfileTrackingService,
    @Inject(TwitterSpaceTrackingService)
    private readonly twitterSpaceTrackingService: TwitterSpaceTrackingService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    if (this.configService.twitter.tweet.active) {
      await this.twitterTweetTrackingService.start()
    }
    if (this.configService.twitter.profile.active) {
      await this.twitterProfileTrackingService.start()
    }
    if (this.configService.twitter.space.active) {
      await this.twitterSpaceTrackingService.start()
    }
    await this.checkSpacesActive(this.spaceCheckInterval)
    await this.checkSpacesPlaylist(this.spaceCheckInterval)
  }

  public async checkSpacesActive(ms?: number) {
    this.logger.info('--> checkSpacesActive')
    try {
      const limiter = twitterSpacesByIdsLimiter
      const spaces = await this.twitterSpaceService.getSpacesForActiveCheck()
      const chunks = Utils.splitArrayIntoChunk(spaces, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((chunk) => limiter.schedule(async () => {
        try {
          const ids = chunk.map((v) => v.id)
          const result = await this.twitterApiService.getSpacesByIds(ids)
          if (!result?.errors?.length) {
            return
          }
          await Promise.allSettled(result.errors.map(async (error) => {
            if (!(error.resource_type === 'space' && error.type.includes('resource-not-found'))) {
              return
            }
            await this.updateSpaceActive(error.resource_id, false)
          }))
        } catch (error) {
          // Ignore
        }
      })))
    } catch (error) {
      this.logger.error(`checkSpacesActive: ${error.message}`)
    }
    if (ms) {
      this.logger.info(`checkSpacesActive: Recheck in ${ms}ms`)
      setTimeout(() => this.checkSpacesActive(), ms)
    }
    this.logger.info('<-- checkSpacesActive')
  }

  public async checkSpacesPlaylist(ms?: number) {
    this.logger.info('--> checkSpacesPlaylist')
    try {
      const limiter = new Bottleneck({ maxConcurrent: 2 })
      const spaces = await this.twitterSpaceService.getSpacesForPlaylistActiveCheck()
      // eslint-disable-next-line max-len
      await Promise.allSettled(spaces.map((v) => limiter.schedule(() => this.checkSpacePlaylist(v))))
    } catch (error) {
      this.logger.error(`checkSpacesPlaylist: ${error.message}`)
    }
    if (ms) {
      this.logger.info(`checkSpacesPlaylist: Recheck in ${ms}ms`)
      setTimeout(() => this.checkSpacesPlaylist(), ms)
    }
    this.logger.info('<-- checkSpacesPlaylist')
  }

  public async checkSpacePlaylist(space: TwitterSpace) {
    this.logger.debug('--> checkSpacePlaylist', { id: space.id })
    try {
      await axios.head(space.playlistUrl)
      await this.updateSpacePlaylistActive(space.id, true)
    } catch (error) {
      if (error.response?.status === 400) {
        await this.updateSpacePlaylistActive(space.id, false)
        return
      }
      this.logger.error(`checkSpacePlaylist: ${error.message}`, { id: space.id, playlistUrl: space.playlistUrl })
    }
    this.logger.debug('<-- checkSpacePlaylist', { id: space.id })
  }

  private async updateSpaceActive(id: string, active: boolean) {
    this.logger.debug('updateSpaceActive', { id, active })
    try {
      await this.twitterSpaceService.updateIsActive(id, active)
    } catch (error) {
      this.logger.error(`updateSpaceActive: ${error.message}`, { id })
    }
  }

  private async updateSpacePlaylistActive(id: string, active: boolean) {
    this.logger.debug('updateSpacePlaylistActive', { id, active })
    try {
      await this.twitterSpaceService.updatePlaylistActive(id, active)
    } catch (error) {
      this.logger.error(`updateSpacePlaylistActive: ${error.message}`, { id })
    }
  }
}
