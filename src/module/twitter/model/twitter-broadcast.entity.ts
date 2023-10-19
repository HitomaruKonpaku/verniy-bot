import { Column, Entity, Index } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_broadcast')
export class TwitterBroadcast extends BaseExternalEntity {
  @Column({ name: 'modified_at', type: 'numeric', nullable: true })
  modifiedAt?: number

  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Index()
  @Column({ name: 'state', type: 'text' })
  state: string

  @Column({ name: 'started_at', type: 'numeric', nullable: true })
  startedAt?: number

  @Column({ name: 'ended_at', type: 'numeric', nullable: true })
  endedAt?: number

  @Column({ name: 'pinged_at', type: 'numeric', nullable: true })
  pingedAt?: number

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'media_id', type: 'text', nullable: true })
  mediaId?: string

  @Column({ name: 'media_key', type: 'text', nullable: true })
  mediaKey?: string

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string

  @Column({ name: 'broadcast_source', type: 'text', nullable: true })
  broadcastSource?: string

  @Column({ name: 'is_available_for_replay', type: 'boolean', nullable: true })
  isAvailableForReplay?: boolean

  @Column({ name: 'is_high_latency', type: 'boolean', nullable: true })
  isHighLatency?: boolean

  @Column({ name: 'has_moderation', type: 'boolean', nullable: true })
  hasModeration?: boolean

  @Column({ name: 'private_chat', type: 'boolean', nullable: true })
  privateChat?: boolean

  @Column({ name: 'friend_chat', type: 'boolean', nullable: true })
  friendChat?: boolean

  @Column({ name: 'width', type: 'numeric', nullable: true })
  width?: number

  @Column({ name: 'height', type: 'numeric', nullable: true })
  height?: number

  @Column({ name: 'camera_rotation', type: 'numeric', nullable: true })
  cameraRotation?: number

  @Column({ name: 'has_location', type: 'boolean', nullable: true })
  hasLocation?: boolean

  @Column({ name: 'lat', type: 'numeric', nullable: true })
  lat?: number

  @Column({ name: 'lng', type: 'numeric', nullable: true })
  lng?: number

  @Column({ name: 'total_watching', type: 'numeric', nullable: true })
  totalWatching?: number

  @Column({ name: 'total_watched', type: 'numeric', nullable: true })
  totalWatched?: number

  @Column({ name: 'playlist_active', type: 'boolean', nullable: true })
  playlistActive?: boolean

  @Column({ name: 'playlist_updated_at', type: 'numeric', nullable: true })
  playlistUpdatedAt?: number

  @Column({ name: 'playlist_url', type: 'text', nullable: true })
  playlistUrl?: string

  user?: TwitterUser
}
