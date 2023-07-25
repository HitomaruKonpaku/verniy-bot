import { Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { SpaceV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { AudioSpaceMetadataState } from '../../api/enum/twitter-graphql.enum'
import { AudioSpace } from '../../api/interface/twitter-graphql.interface'
import { TWITTER_API_LIST_SIZE } from '../../constant/twitter.constant'
import { TwitterSaveAudioSpaceOption } from '../../interface/twitter-option.interface'
import { twitterAudioSpaceLimiter } from '../../twitter.limiter'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterGraphqlSpaceService } from '../api/twitter-graphql-space.service'
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
    @Inject(TwitterGraphqlSpaceService)
    private readonly twitterGraphqlSpaceService: TwitterGraphqlSpaceService,
  ) { }

  public async getOneById(id: string, options?: TwitterSaveAudioSpaceOption) {
    let space = await this.twitterSpaceService.getOneById(id)
    await this.saveAudioSpace(id, { skipPlaylistUrl: !!space?.playlistUrl, ...options })
    space = await this.twitterSpaceService.getOneById(id)
    return space
  }

  public async getOneByIdV2(id: string, refresh = false) {
    let space = !refresh
      ? await this.twitterSpaceService.getOneById(id)
      : null

    if (!space) {
      const result = await this.twitterApiService.getSpaceById(id)
      space = await this.twitterSpaceService.save(TwitterEntityUtil.buildSpace(result.data))

      // Get additional space data
      try {
        await this.saveAudioSpace(space.id)
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

  public async getManyByIdsV2(ids: string[]) {
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

  public async getAllByIdsV2(ids: string[]) {
    this.logger.debug('getAllByIds', { idCount: ids.length })
    if (!ids?.length) {
      return []
    }

    const idChunks = ArrayUtil.splitIntoChunk(ids, TWITTER_API_LIST_SIZE)
    const results = await Promise.allSettled(idChunks.map((idChunk) => this.getManyByIdsV2(idChunk)))
    const spaces = results
      .map((result) => (result.status === 'fulfilled' ? result.value : []))
      .flat()
    return spaces
  }

  public async saveSpace(data: SpaceV2) {
    const space = await this.twitterSpaceService.save(TwitterEntityUtil.buildSpace(data))
    return space
  }

  public async saveSpaces(data: SpaceV2[]) {
    const spaces = await this.twitterSpaceService.saveAll(data.map((v) => TwitterEntityUtil.buildSpace(v)))
    return spaces
  }

  public async saveAudioSpace(id: string, options?: TwitterSaveAudioSpaceOption) {
    const limiter = twitterAudioSpaceLimiter
    const audioSpace = await limiter.schedule(() => this.twitterGraphqlSpaceService.getAudioSpaceByRestId(id))
    this.logger.debug('saveAudioSpace', { id, audioSpace })

    const { metadata } = audioSpace
    if (!metadata) {
      await this.twitterSpaceService.updateFields(id, { isActive: false, modifiedAt: Date.now() })
      return
    }

    await this.twitterSpaceService.save(TwitterEntityUtil.buildSpaceByAudioSpace(audioSpace))

    const canGetPlaylistUrl = !options?.skipPlaylistUrl
      && metadata.state !== AudioSpaceMetadataState.CANCELED
      && (metadata.state === AudioSpaceMetadataState.RUNNING || metadata.is_space_available_for_replay)
    if (canGetPlaylistUrl) {
      await this.saveAudioSpacePlaylist(id, audioSpace)
    }

    await this.saveAudioSpaceById(id)
  }

  public async saveAudioSpaceById(id: string) {
    try {
      const audioSpace = await this.twitterGraphqlSpaceService.getAudioSpaceById(id)
      const { metadata } = audioSpace
      await this.twitterSpaceService.updateFields(id, {
        updatedAt: metadata.updated_at,
      })
    } catch (error) {
      this.logger.error(`saveAudioSpaceById: ${error.message}`, { id })
    }
  }

  public async saveAudioSpacePlaylist(id: string, audioSpace: AudioSpace) {
    this.logger.info('saveAudioSpacePlaylist', { id })
    try {
      const playlistUrl = await this.twitterGraphqlSpaceService.getSpacePlaylistUrl(id, audioSpace)
      const playlistActive = true
      const playlistUpdatedAt = Date.now()
      await this.twitterSpaceService.updateFields(id, {
        playlistActive,
        playlistUpdatedAt,
        playlistUrl,
      })
    } catch (error) {
      this.logger.error(`saveAudioSpacePlaylist: ${error.message}`, { id })
    }
  }

  public async saveUnknownParticipants() {
    const userIds = await this.twitterSpaceService.getUnknownUserIds()
    const result = await Promise.allSettled(userIds.map((userId) => this.twitterUserControllerService.getUserByRestId(userId)))
    return result
  }

  public async checkPlaylistStatus(id: string, playlistUrl: string) {
    if (!id || !playlistUrl) {
      return
    }
    try {
      await axios.head(playlistUrl)
      await this.updatePlaylistStatus(id, playlistUrl, true)
    } catch (error) {
      if ([400, 401, 404].includes(error.response?.status)) {
        await this.updatePlaylistStatus(id, playlistUrl, false)
        return
      }
      this.logger.error(`checkPlaylist: ${error.message}`, { id })
    }
  }

  public async updatePlaylistStatus(id: string, playlistUrl: string, playlistActive: boolean) {
    if (!id || !playlistUrl) {
      return
    }
    try {
      await this.twitterSpaceService.updatePlaylistInfo(id, playlistUrl, playlistActive)
      this.logger.debug('updatePlaylistStatus', { id, active: playlistActive })
    } catch (error) {
      this.logger.error(`updatePlaylistStatus: ${error.message}`, { id })
    }
  }
}
