import { Column, Entity, Index, Unique } from 'typeorm'
import { BaseEntity } from '../../database/model/base.entity'
import { TrackType } from '../enum/track-type.enum'

@Entity('track_user')
@Unique(['type', 'userId'])
export class TrackUser extends BaseEntity {
  @Index()
  @Column({ name: 'type', type: 'text' })
  type: TrackType

  @Column({ name: 'user_id', type: 'text' })
  userId: string
}
