import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { InstagramUser } from './instagram-user.entity'

@Entity('instagram_story')
export class InstagramStory extends BaseExternalEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'expiring_at', type: 'numeric', nullable: true })
  expiringAt?: number

  @Column({ name: 'code', type: 'text', nullable: true })
  code?: string

  @Column({ name: 'original_width', type: 'numeric', nullable: true })
  originalWidth?: number

  @Column({ name: 'original_height', type: 'numeric', nullable: true })
  originalHeight?: number

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string

  user?: InstagramUser
}
