import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { TiktokVideo } from './tiktok-video.entity'

@Entity('tiktok_user')
export class TiktokUser extends BaseExternalEntity {
  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string

  videos?: TiktokVideo[]

  newVideos?: TiktokVideo[]
}
