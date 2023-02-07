import { Column, Entity, Unique } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberOrg } from './vtuber-org.entity'
import { VtuberUser } from './vtuber-user.entity'

@Entity('vtuber_org_member')
@Unique(['orgId', 'userId'])
export class VtuberOrgMember extends BaseExternalUserEntity {
  @Column({ name: 'org_id', type: 'text' })
  orgId: string

  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number

  @Column({ name: 'joined_at', type: 'numeric', nullable: true })
  joinedAt?: number

  org?: VtuberOrg

  user?: VtuberUser
}
