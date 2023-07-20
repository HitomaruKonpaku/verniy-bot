import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { AvatarContent, Fleetline } from '../../interface/twitter-fleet.interface'
import { AudioSpace } from '../../interface/twitter-graphql.interface'
import { Status } from '../../interface/twitter-live-video-stream.interface'
import { TwitterSpaceUtil } from '../../util/twitter-space.util'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlSpaceService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlSpaceService.name })

  public async getSpacesByFleetsAvatarContent(userIds: string[]): Promise<AvatarContent> {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getSpacesByFleetsAvatarContent', { requestId, userCount: userIds.length })
      const { data } = await this.api.fleet.avatar_content(userIds)
      this.logger.debug('<-- getSpacesByFleetsAvatarContent', { requestId })
      return data
    } catch (error) {
      this.logger.error(`getSpacesByFleetsAvatarContent: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getSpacesByFleetsFleetline(): Promise<Fleetline> {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getSpacesByFleetsFleetline', { requestId })
      const { data } = await this.api.fleet.fleetline()
      this.logger.debug('<-- getSpacesByFleetsFleetline', { requestId })
      return data
    } catch (error) {
      this.logger.error(`getSpacesByFleetsFleetline: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getAudioSpaceById(spaceId: string): Promise<AudioSpace> {
    const { data } = await this.api.graphql.AudioSpaceById(spaceId)
    return data?.data?.audioSpace
  }

  public async getAudioSpaceByIdLegacy(spaceId: string): Promise<AudioSpace> {
    const { data } = await this.api.graphql.AudioSpaceById_Legacy(spaceId)
    return data?.data?.audioSpace
  }

  public async getAudioSpaceByRestId(spaceId: string): Promise<AudioSpace> {
    const { data } = await this.api.graphql.AudioSpaceByRestId(spaceId)
    return data?.data?.audio_space_by_rest_ids
  }

  public async getLiveVideoStreamStatus(mediaKey: string): Promise<Status> {
    const { data } = await this.api.liveVideoStream.status(mediaKey)
    return data
  }

  public async getSpacePlaylistUrl(spaceId: string, audioSpace?: AudioSpace): Promise<string> {
    this.logger.warn('getSpacePlaylistUrl', { spaceId })
    if (!audioSpace) {
      // eslint-disable-next-line no-param-reassign
      audioSpace = await this.getAudioSpaceById(spaceId)
      this.logger.info('getSpacePlaylistUrl#audioSpace', { spaceId, audioSpace })
    }
    if (spaceId !== audioSpace.metadata.rest_id) {
      throw new Error('Space id not match')
    }
    const liveVideoStreamStatus = await this.getLiveVideoStreamStatus(audioSpace.metadata.media_key)
    this.logger.info('getSpacePlaylistUrl#liveVideoStreamStatus', { spaceId, liveVideoStreamStatus })
    const dynamicUrl = liveVideoStreamStatus.source.location
    const masterUrl = TwitterSpaceUtil.getMasterPlaylistUrl(dynamicUrl)
    this.logger.info('getSpacePlaylistUrl#playlistUrl', { spaceId, playlistUrl: masterUrl })
    return masterUrl
  }
}
