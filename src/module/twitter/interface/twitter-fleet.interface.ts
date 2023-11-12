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
  broadcast_id: string
  id: string
  title: string
  state: string
  creator_user_id: string
  creator_twitter_user_id: number
  primary_admin_user_id: string
  admin_user_ids?: string[]
  pending_admin_user_ids?: string[]
  admin_twitter_user_ids?: number[]
  pending_admin_twitter_user_ids?: number[]
  max_admin_capacity: number
  max_guest_sessions: number
  conversation_controls: number
  created_at?: number
  updated_at?: number
  ended_at?: number
  start?: string
  scheduled_start?: number
  canceled_at?: number
  listeners?: number[]
  social_proof?: SocialProof[]
  copyright_violations: any
  is_locked: boolean
  is_employee_only: boolean
  rules?: any
  topics?: Topic[]
  is_muted: boolean
  is_space_creator_muted: boolean
  language: string
  enable_server_audio_transcription: boolean
  is_space_available_for_replay: boolean
  replay_start_time: any
  is_trending: boolean
  vf_safety_level: number
  is_featured: boolean
  is_creator_top_host: boolean
  num_tweets_with_space_link: number
  narrow_cast_space_type: number
  disallow_join: boolean
  rsvp_count: number
  nsfw_label_pivot: any
  uk_ru_conflict_label_pivot: any
  total_participating: number
  total_participating_public: number
  total_participated: number
  total_participated_public: number
}

interface LiveContent {
  audiospace?: AudioSpace
  livevideo?: any
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
