import axios from 'axios'
import { TWITTER_API_URL } from '../constants/twitter.constant'
import { TwitterAuthGuestTokenHeaders } from '../interfaces/twitter-api.interface'

export class TwitterGraphqlApi {
  public static async getAudioSpaceById(
    id: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/xjTKygiBMpX44KU8ywLohQ/AudioSpaceById'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          id,
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
    return response
  }
}
