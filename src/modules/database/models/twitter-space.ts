import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from './base/base-external.entity'

@Entity('twitter_space')
export class TwitterSpace extends BaseExternalEntity {
  @Column({ name: 'updated_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date

  @Column({ name: 'creator_id', type: 'text' })
  creatorId: string

  @Column({ name: 'state', type: 'text' })
  state: 'scheduled' | 'live' | 'ended'

  @Column({ name: 'is_ticketed', type: 'boolean', default: false })
  isTicketed?: boolean

  @Column({ name: 'scheduled_start', type: 'numeric', nullable: true })
  scheduledStart?: Date

  @Column({ name: 'started_at', type: 'numeric', nullable: true })
  startedAt?: Date

  @Column({ name: 'ended_at', type: 'numeric', nullable: true })
  endedAt?: Date

  @Column({ name: 'lang', type: 'text', nullable: true })
  lang?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string
}
