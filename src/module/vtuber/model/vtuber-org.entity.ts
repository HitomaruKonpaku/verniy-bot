import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'

@Entity('vtuber_org')
export class VtuberOrg extends BaseExternalUserEntity {
  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'position', type: 'numeric', nullable: true })
  position?: number
}
