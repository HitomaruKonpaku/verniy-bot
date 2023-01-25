import { Inject, Injectable } from '@nestjs/common'
import { SpaceV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { ArrayUtils } from '../../../../utils/array.utils'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { AudioSpaceMetadataState } from '../../enums/twitter-graphql.enum'
import { twitterAudioSpaceLimiter } from '../../twitter.limiter'
import { TwitterEntityUtils } from '../../utils/twitter-entity.utils'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterPublicApiService } from '../api/twitter-public-api.service'
import { TwitterSpaceService } from '../data/twitter-space.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterSpaceControllerService {
  private readonly logger = baseLogger.child({ context: TwitterSpaceControllerService.name })

  constructor(
    @Inject(TwitterSpaceService)
    private readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(TwitterPublicApiService)
    private readonly twitterPublicApiService: TwitterPublicApiService,
  ) { }

  public async getOneById(id: string, refresh = false) {
    let space = !refresh
      ? await this.twitterSpaceService.getOneById(id)
      : null

    if (!space) {
      const result = await this.twitterApiService.getSpaceById(id)
      space = await this.twitterSpaceService.save(TwitterEntityUtils.buildSpace(result.data))

      // Get additional space data
      try {
        const limiter = twitterAudioSpaceLimiter
        await limiter.schedule(
          { priority: 4 },
          () => this.saveAudioSpace(space.id),
        )
        space = await this.twitterSpaceService.getOneById(id)
      } catch (error) {
        this.logger.error(`getOneById#saveAudioSpace: ${error.message}`, { id })
      }

      // Get space creator
      try {
        await this.twitterUserControllerService.getOneById(space.creatorId)
      } catch (error) {
        this.logger.error(`getOneById#getCreator: ${error.message}`, { id })
      }
    }

    return space
  }

  public async getManyByIds(ids: string[]) {
    this.logger.debug('getManyByIds', { idCount: ids.length })
    const res = await this.twitterApiService.getSpacesByIds(ids)
    if (res.errors?.length) {
      try {
        const errorIds = res.errors
          .filter((error) => error.resource_type === 'space' && error.type.includes('resource-not-found'))
          .map((error) => error.resource_id)
        await Promise.all(errorIds.map(async (id) => {
          const active = false
          try {
            this.logger.debug('updateIsActive', { id, active })
            await this.twitterSpaceService.updateIsActive(id, active)
          } catch (error) {
            this.logger.error(`updateIsActive: ${error.message}`, { id })
          }
        }))
      } catch (error) {
        // ignore
      }
    }

    const spaces = res.data.length
      ? await this.saveSpaces(res.data)
      : []
    return spaces
  }

  public async getAllByIds(ids: string[]) {
    this.logger.debug('getAllByIds', { idCount: ids.length })
    if (!ids?.length) {
      return []
    }

    const idChunks = ArrayUtils.splitIntoChunk(ids, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(idChunks.map((idChunk) => this.getManyByIds(idChunk)))
    const spaces = results
      .map((result) => (result.status === 'fulfilled' ? result.value : []))
      .flat()
    return spaces
  }

  public async saveSpace(data: SpaceV2) {
    const space = await this.twitterSpaceService.save(TwitterEntityUtils.buildSpace(data))
    return space
  }

  public async saveSpaces(data: SpaceV2[]) {
    const spaces = await this.twitterSpaceService.saveAll(data.map((v) => TwitterEntityUtils.buildSpace(v)))
    return spaces
  }

  public async saveAudioSpace(id: string) {
    const audioSpace = await this.twitterPublicApiService.getAudioSpaceById(id)
    this.logger.info('saveAudioSpace', { id, audioSpace })

    let playlistUrl: string
    let playlistActive: boolean

    if (audioSpace.metadata.state === AudioSpaceMetadataState.RUNNING) {
      try {
        playlistUrl = await this.twitterPublicApiService.getSpacePlaylistUrl(id, audioSpace)
        playlistActive = true
      } catch (error) {
        this.logger.error(`saveAudioSpace#getSpacePlaylistUrl: ${error.message}`, { id })
      }
    }

    await this.twitterSpaceService.updateFields(id, {
      totalLiveListeners: audioSpace.metadata.total_live_listeners,
      totalReplayWatched: audioSpace.metadata.total_replay_watched,
      isAvailableForReplay: audioSpace.metadata.is_space_available_for_replay,
      isAvailableForClipping: audioSpace.metadata.is_space_available_for_clipping,
      playlistUrl,
      playlistActive,
    })
  }
}
