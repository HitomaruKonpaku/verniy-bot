import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/services/base-cron.service'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { TwitterSpace } from '../../models/twitter-space.entity'
import { twitterSpacePlaylistLimiter } from '../../twitter.limiter'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterSpaceService } from '../data/twitter-space.service'

@Injectable()
export class TwitterSpaceCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterSpaceCronService.name })

  protected cronTime = '0 0 */12 * * *'

  constructor(
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) {
    super()
  }

  protected async onTick() {
    await this.checkSpacesActive()
    await this.checkSpacesPlaylist()
  }

  private async checkSpacesActive() {
    this.logger.info('--> checkSpacesActive')
    try {
      const spaces = await this.twitterSpaceService.getManyForActiveCheck()
      this.logger.debug('checkSpacesActive', { spaceCount: spaces.length })
      const chunks = ArrayUtils.splitIntoChunk(spaces, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map(async (chunk) => {
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
      }))
    } catch (error) {
      this.logger.error(`checkSpacesActive: ${error.message}`)
    }
    this.logger.info('<-- checkSpacesActive')
  }

  private async checkSpacesPlaylist() {
    this.logger.info('--> checkSpacesPlaylist')
    try {
      const limiter = twitterSpacePlaylistLimiter
      const spaces = await this.twitterSpaceService.getManyForPlaylistActiveCheck()
      this.logger.debug('checkSpacesPlaylist', { spaceCount: spaces.length })
      await Promise.allSettled(spaces.map((v) => limiter.schedule(() => this.checkSpacePlaylist(v))))
    } catch (error) {
      this.logger.error(`checkSpacesPlaylist: ${error.message}`)
    }
    this.logger.info('<-- checkSpacesPlaylist')
  }

  private async checkSpacePlaylist(space: TwitterSpace) {
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
