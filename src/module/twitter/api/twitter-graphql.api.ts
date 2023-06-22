import axios from 'axios'
import { TWITTER_API_URL } from '../constant/twitter.constant'
import { TwitterAuthGuestTokenHeaders } from '../interface/twitter-api.interface'

export class TwitterGraphqlApi {
  public static async getUserByRestId(
    userId: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const queryId = '1YAM811Q8Ry4XyPpJclURQ'
    const url = `graphql/${queryId}/UserByRestId`
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
          highlights_tweets_tab_ui_enabled: true,
          creator_subscriptions_tweet_preview_api_enabled: false,
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
    const queryId = 'pVrmNaXcxPjisIvKtLDMEA'
    const url = `graphql/${queryId}/UserByScreenName`
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
          highlights_tweets_tab_ui_enabled: true,
          creator_subscriptions_tweet_preview_api_enabled: false,
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
    const queryId = 'CdG2Vuc1v6F5JyEngGpxVw'
    const url = `graphql/${queryId}/UserTweets`
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          userId,
          count: 20,
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
    const queryId = 'zQxfEr5IFxQ2QZ-XMJlKew'
    const url = `graphql/${queryId}/UserTweetsAndReplies`
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          userId,
          count: 20,
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

  public static async getTweetDetail(
    id: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const queryId = 'VWFGPVAGkZMGRKGe3GFFnA'
    const url = `graphql/${queryId}/TweetDetail`
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          focalTweetId: id,
          with_rux_injections: false,
          includePromotedContent: true,
          withCommunity: true,
          withQuickPromoteEligibilityTweetFields: true,
          withBirdwatchNotes: false,
          withVoice: true,
          withV2Timeline: true,
        },
        features: {
          rweb_lists_timeline_redesign_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          creator_subscriptions_tweet_preview_api_enabled: true,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          tweet_awards_web_tipping_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: true,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
          longform_notetweets_rich_text_read_enabled: true,
          longform_notetweets_inline_media_enabled: true,
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
    const queryId = 'F7RgOkr-vR2cxftJI_UAuQ'
    const url = `graphql/${queryId}/AudioSpaceById`
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

  public static async getAudioSpaceByIdLegacy(
    id: string,
    headers: TwitterAuthGuestTokenHeaders,
  ) {
    const queryId = 'Uv5R_-Chxbn1FEkyUkSW2w'
    const url = `graphql/${queryId}/AudioSpaceById`
    const response = await axios.get(url, {
      baseURL: TWITTER_API_URL,
      headers,
      params: {
        variables: {
          id,
          isMetatagsQuery: false,
          withSuperFollowsUserFields: false,
          withBirdwatchPivots: false,
          withDownvotePerspective: false,
          withReactionsMetadata: false,
          withReactionsPerspective: false,
          withSuperFollowsTweetFields: false,
          withReplays: true,
          withScheduledSpaces: true,
        },
      },
    })
    return response
  }
}
