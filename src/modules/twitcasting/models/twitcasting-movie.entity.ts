import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base/base-external.entity'
import { TwitCastingUser } from './twitcasting-user.entity'

@Entity('twitcasting_movie')
export class TwitCastingMovie extends BaseExternalEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'is_live', type: 'boolean', default: false })
  isLive?: boolean

  @Column({ name: 'is_recorded', type: 'boolean', default: false })
  isRecorded?: boolean

  @Column({ name: 'is_collabo', type: 'boolean', default: false })
  isCollabo?: boolean

  @Column({ name: 'is_protected', type: 'boolean', default: false })
  isProtected?: boolean

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'subtitle', type: 'text', nullable: true })
  subtitle?: string

  @Column({ name: 'last_owner_comment', type: 'text', nullable: true })
  lastOwnerComment?: string

  @Column({ name: 'category', type: 'text', nullable: true })
  category?: string

  @Column({ name: 'large_thumbnail', type: 'text', nullable: true })
  largeThumbnail?: string

  @Column({ name: 'small_thumbnail', type: 'text', nullable: true })
  smallThumbnail?: string

  @Column({ name: 'duration', type: 'numeric', default: 0 })
  duration?: number

  user?: TwitCastingUser
}
