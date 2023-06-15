import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberGroup } from './vtuber-group.entity'
import { VtuberUser } from './vtuber-user.entity'

@Entity('vtuber_org')
export class VtuberOrg extends BaseExternalUserEntity {
  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'short_name', type: 'text', nullable: true })
  shortName?: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number

  groups?: VtuberGroup[]

  users?: VtuberUser[]
}
