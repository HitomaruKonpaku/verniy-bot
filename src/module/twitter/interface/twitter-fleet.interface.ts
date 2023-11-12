/* eslint-disable camelcase */

interface BaseResponse {
  refresh_delay_secs: number
}

interface SocialProof {
  user_id: number
  user_id_str: string
  role: string
}

interface Topic {
  topic_id: string
  name: string
}

interface AudioSpace {
  broadcast_id?: string
  id?: string
  title?: string
  state?: string
  creator_user_id?: string
  creator_twitter_user_id?: number
  primary_admin_user_id?: string
  admin_user_ids?: string[]
  pending_admin_user_ids?: string[]
  admin_twitter_user_ids?: number[]
  pending_admin_twitter_user_ids?: number[]
  max_admin_capacity?: number
  max_guest_sessions?: number
  conversation_controls?: number
  created_at?: number
  updated_at?: number
  ended_at?: number
  start?: string
  scheduled_start?: number
  canceled_at?: number
  listeners?: number[]
  social_proof?: SocialProof[]
  copyright_violations?: any
  is_locked?: boolean
  is_employee_only?: boolean
  rules?: any
  topics?: Topic[]
  is_muted?: boolean
  is_space_creator_muted?: boolean
  language?: string
  enable_server_audio_transcription?: boolean
  is_space_available_for_replay?: boolean
  replay_start_time?: any
  is_trending?: boolean
  vf_safety_level?: number
  is_featured?: boolean
  is_creator_top_host?: boolean
  num_tweets_with_space_link?: number
  narrow_cast_space_type?: number
  disallow_join?: boolean
  rsvp_count?: number
  nsfw_label_pivot?: any
  uk_ru_conflict_label_pivot?: any
  total_participating?: number
  total_participating_public?: number
  total_participated?: number
  total_participated_public?: number
}

interface LiveVideo {
  class_name?: string
  id?: string
  created_at?: string
  updated_at?: string
  user_id?: string
  user_display_name?: string
  username?: string
  twitter_id?: string
  twitter_username?: string
  profile_image_url?: string
  state?: string
  is_locked?: boolean
  friend_chat?: boolean
  private_chat?: boolean
  language?: string
  version?: number
  replay_title_edited?: boolean
  start?: string
  ping?: string
  scheduled_start?: string
  scheduled_end?: string
  has_moderation?: boolean
  has_location?: boolean
  city?: string
  country?: string
  country_state?: string
  iso_code?: string
  ip_lat?: number
  ip_lng?: number
  width?: number
  height?: number
  camera_rotation?: number
  image_url?: string
  image_url_small?: string
  image_url_medium?: string
  status?: string
  broadcast_source?: string
  available_for_replay?: boolean
  is_space_available_for_replay?: boolean
  expiration?: number
  tweet_id?: string
  tweet_external?: boolean
  media_key?: string
  pre_live_slate?: string
  is_high_latency?: boolean
  n_total_watching?: number
  n_watching?: number
  n_web_watching?: number
  n_total_watched?: number
  n_web_watched?: number
  n_total_live_watched?: number
}

interface LiveContent {
  audiospace?: AudioSpace
  livevideo?: LiveVideo
}

interface AvatarContentUser {
  spaces: { live_content: LiveContent }
  participants: number[]
}

interface Thread {
  fully_read: boolean
  live_content: LiveContent
  mentions?: number[]
  mentions_str?: string[]
  participants?: number[]
  participants_str?: string[]
  thread_id: string
  user_id: number
  user_id_str: string
}

export interface AvatarContent extends BaseResponse {
  users: Record<string, AvatarContentUser>
}

export interface Fleetline extends BaseResponse {
  threads: Thread[]
}
