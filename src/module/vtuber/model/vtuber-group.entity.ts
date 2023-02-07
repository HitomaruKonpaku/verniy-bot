import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberOrg } from './vtuber-org.entity'

@Entity('vtuber_group')
export class VtuberGroup extends BaseExternalUserEntity {
  @Column({ name: 'org_id', type: 'text' })
  orgId: string

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'short_name', type: 'text', nullable: true })
  shortName?: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number

  org?: VtuberOrg
}
