import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { CronJob } from 'cron'
import { CRON_TIME_ZONE } from '../../../../constants/cron.constant'
import { baseLogger } from '../../../../logger'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { TwitterSpace } from '../../models/twitter-space.entity'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterSpaceService } from '../data/twitter-space.service'

@Injectable()
export class TwitterSpaceCronService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceCronService.name })

  private readonly CRON_TIME = '0 0 */12 * * *'

  private cronJob: CronJob

  constructor(
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.initCron()
    this.cronJob.start()
  }

  private initCron() {
    this.cronJob = new CronJob(
      this.CRON_TIME,
      () => this.onTick(),
      null,
      false,
      CRON_TIME_ZONE,
    )
  }

  private async onTick() {
    await this.checkSpacesActive()
    await this.checkSpacesPlaylist()
  }

  private async checkSpacesActive() {
    this.logger.info('--> checkSpacesActive')
    try {
      const spaces = await this.twitterSpaceService.getManyForActiveCheck()
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
      const limiter = new Bottleneck({ maxConcurrent: 1 })
      const spaces = await this.twitterSpaceService.getManyForPlaylistActiveCheck()
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
