/* eslint-disable class-methods-use-this */
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { TwitterFleetApi } from '../../apis/twitter-fleet.api'
import { TwitterGraphqlApi } from '../../apis/twitter-graphql.api'
import { TwitterGuestApi } from '../../apis/twitter-guest.api'
import { TwitterLiveVideoStreamApi } from '../../apis/twitter-live-video-stream.api'
import { TWITTER_PUBLIC_AUTHORIZATION } from '../../constants/twitter.constant'
import { AvatarContent, Fleetline } from '../../interfaces/twitter-fleet.interface'
import { AudioSpace } from '../../interfaces/twitter-graphql.interface'
import { Status } from '../../interfaces/twitter-live-video-stream.interface'
import { TwitterSpaceUtils } from '../../utils/twitter-space.utils'
import { TwitterTokenService } from '../twitter-token.service'

@Injectable()
export class TwitterPublicApiService {
  private readonly logger = baseLogger.child({ context: TwitterPublicApiService.name })

  constructor(
    @Inject(forwardRef(() => TwitterTokenService))
    private readonly twitterTokenService: TwitterTokenService,
  ) { }

  private getCookieHeaders() {
    const token = this.twitterTokenService.getAuthToken()
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      cookie: [`auth_token=${token}`].join(';'),
    }
    return headers
  }

  private async getGuestTokenHeaders() {
    const guestToken = await this.twitterTokenService.getGuestToken()
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      'x-guest-token': guestToken,
    }
    return headers
  }

  public async getGuestToken(): Promise<string> {
    const { data } = await TwitterGuestApi.postActivate({ authorization: TWITTER_PUBLIC_AUTHORIZATION })
    return data.guest_token
  }

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
    const masterUrl = TwitterSpaceUtils.getMasterPlaylistUrl(dynamicUrl)
    this.logger.info('getSpacePlaylistUrl#playlistUrl', { spaceId, playlistUrl: masterUrl })
    return masterUrl
  }
}
