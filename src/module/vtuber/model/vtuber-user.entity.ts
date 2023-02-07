import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'

@Entity('vtuber_user')
export class VtuberUser extends BaseExternalUserEntity {
  @Column({ name: 'is_vsinger', type: 'boolean', default: false })
  isVsinger?: boolean

  @Column({ name: 'name', type: 'text' })
  name: string

  @Column({ name: 'original_name', type: 'text', nullable: true })
  originalName?: string

  @Column({ name: 'short_name', type: 'text', nullable: true })
  shortName?: string

  @Column({ name: 'debut_at', type: 'numeric', nullable: true })
  debutAt?: number
}
