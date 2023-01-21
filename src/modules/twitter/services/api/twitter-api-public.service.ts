/* eslint-disable class-methods-use-this */
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { TWITTER_PUBLIC_AUTHORIZATION } from '../../constants/twitter.constant'
import { AudioSpace, LiveVideoStreamStatus } from '../../interfaces/twitter.interface'
import { TwitterSpaceUtils } from '../../utils/twitter-space.utils'
import { TwitterTokenService } from '../twitter-token.service'

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

  public async getSpacesByFleetsAvatarContent(userIds: string[]) {
    const requestId = randomUUID()
    try {
      const token = this.twitterTokenService.getAuthToken()
      const url = 'https://twitter.com/i/api/fleets/v1/avatar_content'
      const headers = {
        authorization: TWITTER_PUBLIC_AUTHORIZATION,
        cookie: [`auth_token=${token}`].join(';'),
      }
      this.logger.debug('--> getSpacesByFleetsAvatarContent', { requestId, userCount: userIds.length })
      const { data } = await axios.get(url, {
        headers,
        params: {
          user_ids: userIds.join(','),
          only_spaces: true,
        },
      })
      this.logger.debug('<-- getSpacesByFleetsAvatarContent', { requestId })
      return data
    } catch (error) {
      this.logger.error(`getSpacesByFleetsAvatarContent: ${error.message}`, { requestId })
      throw error
    }
  }

  public async getAudioSpaceById(spaceId: string) {
    const url = 'https://api.twitter.com/graphql/xjTKygiBMpX44KU8ywLohQ/AudioSpaceById'
    const headers = await this.getHeaders()
    const { data } = await axios.get(url, {
      headers,
      params: {
        variables: {
          id: spaceId,
          isMetatagsQuery: true,
          withSuperFollowsUserFields: true,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: true,
          withReplays: true,
        },
        features: {
          spaces_2022_h2_clipping: true,
          spaces_2022_h2_spaces_communities: true,
          responsive_web_twitter_blue_verified_badge_is_enabled: true,
          verified_phone_label_enabled: false,
          view_counts_public_visibility_enabled: true,
          longform_notetweets_consumption_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          responsive_web_uc_gql_enabled: true,
          vibe_api_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
          interactive_text_enabled: true,
          responsive_web_text_conversations_enabled: false,
          responsive_web_enhance_cards_enabled: false,
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
