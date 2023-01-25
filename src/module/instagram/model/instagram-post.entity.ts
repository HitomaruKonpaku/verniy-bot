import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'
import { InstagramUser } from './instagram-user.entity'

@Entity('instagram_post')
export class InstagramPost extends BaseExternalEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'shortcode', type: 'text' })
  shortcode: string

  @Column({ name: 'is_video', type: 'boolean', default: false })
  isVideo?: boolean

  @Column({ name: 'display_url', type: 'text', nullable: true })
  displayUrl?: string

  @Column({ name: 'video_url', type: 'text', nullable: true })
  videoUrl?: string

  user?: InstagramUser
}
