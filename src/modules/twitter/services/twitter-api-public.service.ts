/* eslint-disable class-methods-use-this */
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { logger as baseLogger } from '../../../logger'
import { TWITTER_PUBLIC_AUTHORIZATION } from '../constants/twitter.constant'
import { AudioSpace, LiveVideoStreamStatus } from '../interfaces/twitter.interface'
import { TwitterSpaceUtils } from '../utils/TwitterSpaceUtils'
import { TwitterTokenService } from './twitter-token.service'

@Injectable()
export class TwitterApiPublicService {
  private readonly logger = baseLogger.child({ context: TwitterApiPublicService.name })

  constructor(
    @Inject(forwardRef(() => TwitterTokenService))
    private readonly twitterTokenService: TwitterTokenService,
  ) { }

  private async getHeaders() {
    const guestToken = await this.twitterTokenService.getGuestToken()
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      'x-guest-token': guestToken,
    }
    return headers
  }

  public async getGuestToken(): Promise<string> {
    const { data } = await axios.request({
      method: 'POST',
      url: 'https://api.twitter.com/1.1/guest/activate.json',
      headers: { authorization: TWITTER_PUBLIC_AUTHORIZATION },
    })
    return data.guest_token
  }

  public async getAudioSpaceById(spaceId: string) {
    const url = 'https://twitter.com/i/api/graphql/Uv5R_-Chxbn1FEkyUkSW2w/AudioSpaceById'
    const headers = await this.getHeaders()
    const { data } = await axios.get(url, {
      headers,
      params: {
        variables: {
          id: spaceId,
          isMetatagsQuery: false,
          withSuperFollowsUserFields: false,
          withBirdwatchPivots: false,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withReplays: false,
          withScheduledSpaces: false,
        },
      },
    })
    return data?.data?.audioSpace as AudioSpace
  }

  public async getLiveVideoStreamStatus(mediaKey: string) {
    const url = `https://twitter.com/i/api/1.1/live_video_stream/status/${mediaKey}`
    const headers = await this.getHeaders()
    const { data } = await axios.get<LiveVideoStreamStatus>(url, { headers })
    return data
  }

  public async getSpacePlaylistUrl(spaceId: string): Promise<string> {
    const audioSpace = await this.getAudioSpaceById(spaceId)
    this.logger.debug('getSpacePlaylistUrl#audioSpace', { audioSpace })
    const liveVideoStreamStatus = await this.getLiveVideoStreamStatus(audioSpace.metadata.media_key)
    this.logger.debug('getSpacePlaylistUrl#liveVideoStreamStatus', { liveVideoStreamStatus })
    const dynamicUrl = liveVideoStreamStatus.source.location
    const masterUrl = TwitterSpaceUtils.getMasterPlaylistUrl(dynamicUrl)
    this.logger.info('getSpacePlaylistUrl#playlistUrl', { playlistUrl: masterUrl })
    return masterUrl
  }
}
