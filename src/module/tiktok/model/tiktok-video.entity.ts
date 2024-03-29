import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { TiktokUser } from './tiktok-user.entity'

@Entity('tiktok_video')
export class TiktokVideo extends BaseExternalEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  src?: string

  user?: TiktokUser
}
