import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberAccount } from './vtuber-account.entity'
import { VtuberOrg } from './vtuber-org.entity'

@Entity('vtuber_user')
export class VtuberUser extends BaseExternalUserEntity {
  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'short_name', type: 'text', nullable: true })
  shortName?: string

  @Column({ name: 'original_name', type: 'text', nullable: true })
  originalName?: string

  @Column({ name: 'debut_at', type: 'numeric', nullable: true })
  debutAt?: number

  @Column({ name: 'is_vsinger', type: 'boolean', default: false })
  isVsinger?: boolean

  @Column({ name: 'org_id', type: 'text', nullable: true })
  orgId?: string

  org?: VtuberOrg

  accounts?: VtuberAccount[]
}
