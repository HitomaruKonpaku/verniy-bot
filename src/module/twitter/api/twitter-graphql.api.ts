import axios from 'axios'
import { TWITTER_API_URL } from '../constant/twitter.constant'
import { TwitterAuthGuestTokenHeaders } from '../interface/twitter-api.interface'

export class TwitterGraphqlApi {
  public static async getUserByRestId(
    userId: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/GazOglcBvgLigl3ywt6b3Q/UserByRestId'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          userId,
          withSafetyModeUserFields: true,
        },
        features: {
          blue_business_profile_image_shape_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
        },
      },
    })
    return response
  }

  public static async getUserByScreenName(
    screenName: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/sLVLhk0bGj3MVFEKTdax1w/UserByScreenName'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          screen_name: screenName,
          withSafetyModeUserFields: true,
        },
        features: {
          blue_business_profile_image_shape_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
        },
      },
    })
    return response
  }

  public static async getUserTweets(
    userId: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/CdG2Vuc1v6F5JyEngGpxVw/UserTweets'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          userId,
          count: 10,
          includePromotedContent: true,
          withQuickPromoteEligibilityTweetFields: true,
          withVoice: true,
          withV2Timeline: true,
        },
        features: {
          blue_business_profile_image_shape_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          vibe_api_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: false,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
          interactive_text_enabled: true,
          responsive_web_text_conversations_enabled: false,
          longform_notetweets_rich_text_read_enabled: true,
          responsive_web_enhance_cards_enabled: false,
        },
      },
    })
    return response
  }

  public static async getUserTweetsAndReplies(
    userId: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/zQxfEr5IFxQ2QZ-XMJlKew/UserTweetsAndReplies'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          userId,
          count: 10,
          includePromotedContent: true,
          withCommunity: true,
          withVoice: true,
          withV2Timeline: true,
        },
        features: {
          blue_business_profile_image_shape_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          vibe_api_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: false,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
          interactive_text_enabled: true,
          responsive_web_text_conversations_enabled: false,
          longform_notetweets_rich_text_read_enabled: true,
          responsive_web_enhance_cards_enabled: false,
        },
      },
    })
    return response
  }

  public static async getAudioSpaceById(
    id: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const url = 'graphql/F7RgOkr-vR2cxftJI_UAuQ/AudioSpaceById'
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          id,
          isMetatagsQuery: false,
          withReplays: true,
        },
        features: {
          spaces_2022_h2_clipping: true,
          spaces_2022_h2_spaces_communities: true,
          blue_business_profile_image_shape_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          vibe_api_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: false,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
          responsive_web_graphql_timeline_navigation_enabled: true,
          interactive_text_enabled: true,
          responsive_web_text_conversations_enabled: false,
          longform_notetweets_rich_text_read_enabled: true,
          responsive_web_enhance_cards_enabled: false,
        },
      },
    })
    return response
  }
}
