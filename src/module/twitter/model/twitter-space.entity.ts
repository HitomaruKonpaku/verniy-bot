import { Column, Entity, Index } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { dbArrayTransformer } from '../../database/transformer/transformer'
import { AudioSpaceMetadataState } from '../api/enum/twitter-graphql.enum'
import { SpaceState } from '../enum/twitter-space.enum'
import { TwitterUser } from './twitter-user.entity'

@Entity('twitter_space')
export class TwitterSpace extends BaseExternalEntity {
  @Column({ name: 'modified_at', type: 'numeric', nullable: true })
  modifiedAt?: number

  @Column({ name: 'creator_id', type: 'text' })
  creatorId: string

  @Index()
  @Column({ name: 'state', type: 'text', default: SpaceState.LIVE })
  state: SpaceState

  @Index()
  @Column({ name: 'alt_state', type: 'text', nullable: true })
  altState?: AudioSpaceMetadataState

  @Column({ name: 'is_ticketed', type: 'boolean', nullable: true })
  isTicketed?: boolean

  @Column({ name: 'scheduled_start', type: 'numeric', nullable: true })
  scheduledStart?: number

  @Column({ name: 'started_at', type: 'numeric', nullable: true })
  startedAt?: number

  @Column({ name: 'ended_at', type: 'numeric', nullable: true })
  endedAt?: number

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({
    name: 'host_ids',
    type: 'text',
    nullable: true,
    transformer: dbArrayTransformer,
  })
  hostIds?: string[]

  @Column({
    name: 'speaker_ids',
    type: 'text',
    nullable: true,
    transformer: dbArrayTransformer,
  })
  speakerIds?: string[]

  @Column({ name: 'participant_count', type: 'numeric', nullable: true })
  participantCount?: number

  @Column({ name: 'total_live_listeners', type: 'numeric', nullable: true })
  totalLiveListeners?: number

  @Column({ name: 'total_replay_watched', type: 'numeric', nullable: true })
  totalReplayWatched?: number

  @Column({ name: 'is_available_for_replay', type: 'boolean', nullable: true })
  isAvailableForReplay?: boolean

  @Column({ name: 'is_available_for_clipping', type: 'boolean', nullable: true })
  isAvailableForClipping?: boolean

  @Column({ name: 'narrow_cast_space_type', type: 'numeric', nullable: true })
  narrowCastSpaceType?: number

  @Column({ name: 'subscriber_count', type: 'numeric', nullable: true })
  subscriberCount?: number

  @Column({ name: 'tickets_sold', type: 'numeric', nullable: true })
  ticketsSold?: number

  @Column({ name: 'tickets_total', type: 'numeric', nullable: true })
  ticketsTotal?: number

  @Column({ name: 'playlist_active', type: 'boolean', nullable: true })
  playlistActive?: boolean

  @Column({ name: 'playlist_updated_at', type: 'numeric', nullable: true })
  playlistUpdatedAt?: number

  @Column({ name: 'playlist_url', type: 'text', nullable: true })
  playlistUrl?: string

  creator?: TwitterUser

  hosts?: TwitterUser[]

  speakers?: TwitterUser[]
}
