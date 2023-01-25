import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/models/base-external-user.entity'
import { TiktokVideo } from './tiktok-video.entity'

@Entity('tiktok_user')
export class TiktokUser extends BaseExternalUserEntity {
  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string

  videos?: TiktokVideo[]

  newVideos?: TiktokVideo[]
}
