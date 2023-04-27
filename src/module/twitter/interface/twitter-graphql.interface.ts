/* eslint-disable camelcase */

import { AudioSpaceMetadataState } from '../enum/twitter-graphql.enum'

export interface AudioSpaceMetadata {
  rest_id: string
  state: AudioSpaceMetadataState
  title?: string
  media_key?: string
  created_at?: number
  scheduled_start?: number
  started_at?: number
  ended_at?: string
  updated_at?: number
  disallow_join?: boolean
  narrow_cast_space_type?: number
  is_employee_only?: boolean
  is_locked?: boolean
  is_space_available_for_replay?: boolean
  is_space_available_for_clipping?: boolean
  conversation_controls?: number
  total_replay_watched?: number
  total_live_listeners?: number
  creator_results: {
    result: {
      id: string
      rest_id: string
      is_blue_verified?: boolean
      legacy: {
        created_at: string
        default_profile: boolean
        default_profile_image: boolean
        description: string
        fast_followers_count: number
        favourites_count: number
        followers_count: number
        friends_count: number
        has_custom_timelines: boolean
        is_translator: boolean
        listed_count: number
        location: string
        media_count: number
        name: string
        normal_followers_count: number
        profile_banner_url: string
        profile_image_url_https: string
        profile_interstitial_type: string
        protected: boolean
        screen_name: string
        statuses_count: number
        translator_type?: string
        url?: string
        verified: boolean
        [key: string]: any
      }
      [key: string]: any
    }
    [key: string]: any
  }
  [key: string]: any
}

export interface AudioSpaceParticipantUser {
  rest_id: string
}

export interface AudioSpaceParticipantUserResults extends AudioSpaceParticipantUser {
  result: {
    has_nft_avatar?: boolean
    is_blue_verified?: boolean
  }
}

export interface AudioSpaceParticipant {
  periscope_user_id: string
  start: number
  twitter_screen_name: string
  display_name: string
  avatar_url: string
  is_verified: boolean
  is_muted_by_admin: boolean
  is_muted_by_guest: boolean
  user_results: AudioSpaceParticipantUserResults
  user?: AudioSpaceParticipantUser
  [key: string]: any
}

export interface AudioSpaceParticipants {
  total: number
  admins: AudioSpaceParticipant[]
  speakers: AudioSpaceParticipant[]
  listeners: AudioSpaceParticipant[]
}

export interface AudioSpace {
  metadata: AudioSpaceMetadata
  is_subscribed?: boolean
  participants?: AudioSpaceParticipants
  sharings?: any
}
