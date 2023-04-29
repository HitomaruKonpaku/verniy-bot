import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { TwitterFleetApi } from '../../api/twitter-fleet.api'
import { TwitterGraphqlApi } from '../../api/twitter-graphql.api'
import { TwitterLiveVideoStreamApi } from '../../api/twitter-live-video-stream.api'
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
      const { data } = await TwitterFleetApi.getAvatarContent(
        userIds,
        this.getCookieHeaders(),
      )
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
      const { data } = await TwitterFleetApi.getFleetline(
        this.getCookieHeaders(),
      )
      this.logger.debug('<-- getSpacesByFleetsFleetline', { requestId })
      return data
    } catch (error) {
      this.logger.error(`getSpacesByFleetsFleetline: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getAudioSpaceById(spaceId: string): Promise<AudioSpace> {
    const { data } = await TwitterGraphqlApi.getAudioSpaceById(
      spaceId,
      await this.getGuestTokenHeaders(),
    )
    return data?.data?.audioSpace
  }

  public async getAudioSpaceByIdLegacy(spaceId: string): Promise<AudioSpace> {
    const { data } = await TwitterGraphqlApi.getAudioSpaceByIdLegacy(
      spaceId,
      await this.getGuestTokenHeaders(),
    )
    return data?.data?.audioSpace
  }

  public async getLiveVideoStreamStatus(mediaKey: string): Promise<Status> {
    const { data } = await TwitterLiveVideoStreamApi.getStatus(
      mediaKey,
      await this.getGuestTokenHeaders(),
    )
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
