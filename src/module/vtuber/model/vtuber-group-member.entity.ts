import { Column, Entity, Unique } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberGroup } from './vtuber-group.entity'
import { VtuberUser } from './vtuber-user.entity'

@Entity('vtuber_group_member')
@Unique(['groupId', 'userId'])
export class VtuberGroupMember extends BaseExternalUserEntity {
  @Column({ name: 'group_id', type: 'text' })
  groupId: string

  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number

  @Column({ name: 'joined_at', type: 'numeric', nullable: true })
  joinedAt?: number

  group?: VtuberGroup

  user?: VtuberUser
}
