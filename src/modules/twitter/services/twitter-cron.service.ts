import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { CronJob } from 'cron'
import { logger as baseLogger } from '../../../logger'
import { ArrayUtils } from '../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterSpace } from '../models/twitter-space.entity'
import { TwitterApiService } from './twitter-api.service'
import { TwitterSpaceService } from './twitter-space.service'
import { TwitterUserService } from './twitter-user.service'

@Injectable()
export class TwitterCronService {
  private readonly logger = baseLogger.child({ context: TwitterCronService.name })

  private userCheckCronJob: CronJob
  private spaceCheckCronJob: CronJob

  constructor(
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
  ) {
    const cronTimeZone = 'Asia/Ho_Chi_Minh'
    this.userCheckCronJob = new CronJob('0 0 */6 * * *', () => this.checkUsers(), null, false, cronTimeZone)
    this.spaceCheckCronJob = new CronJob('0 0 */12 * * *', () => this.checkSpaces(), null, false, cronTimeZone)
  }

  public start() {
    this.logger.info('Starting...')
    this.userCheckCronJob.start()
    this.spaceCheckCronJob.start()
  }

  public async checkUsers() {
    this.logger.info('--> checkUsers')
    try {
      const limiter = new Bottleneck({ maxConcurrent: 1 })
      const twitterUsers = await this.twitterUserService.getManyForCheck()
      const chunks = ArrayUtils.splitIntoChunk(twitterUsers, TWITTER_API_LIST_SIZE)
      await Promise.allSettled(chunks.map((chunk) => limiter.schedule(async () => {
        try {
          const ids = chunk.map((v) => v.id)
          const users = await this.twitterApiService.getUsersByUserIds(ids)
          const inactiveIdSet = new Set(ids)
          users.forEach((user) => {
            inactiveIdSet.delete(user.id_str)
            this.twitterUserService.updateByUserObject(user)
              .catch((error) => this.logger.error(`checkUsers#updateByUserObject: ${error.message}`, { id: user.id_str, user }))
          })
          inactiveIdSet.forEach((id) => {
            this.twitterUserService.updateIsActive(id, false)
              .catch((error) => this.logger.error(`checkUsers#updateIsActive: ${error.message}`, { id }))
          })
        } catch (error) {
          // Ignore
        }
      })))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
    this.logger.info('<-- checkUsers')
  }

  public async checkSpaces() {
    await this.checkSpacesActive()
    await this.checkSpacesPlaylist()
  }

  public async checkSpacesActive() {
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

  public async checkSpacesPlaylist() {
    this.logger.info('--> checkSpacesPlaylist')
    try {
      const limiter = new Bottleneck({ maxConcurrent: 1 })
      const spaces = await this.twitterSpaceService.getManyForPlaylistActiveCheck()
      // eslint-disable-next-line max-len
      await Promise.allSettled(spaces.map((v) => limiter.schedule(() => this.checkSpacePlaylist(v))))
    } catch (error) {
      this.logger.error(`checkSpacesPlaylist: ${error.message}`)
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
