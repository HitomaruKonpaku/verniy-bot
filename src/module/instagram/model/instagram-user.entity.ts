import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { InstagramPost } from './instagram-post.entity'
import { InstagramStory } from './instagram-story.entity'

@Entity('instagram_user')
export class InstagramUser extends BaseExternalUserEntity {
  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text', nullable: true })
  name?: string

  @Column({ type: 'text', nullable: true })
  biography?: string

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate?: boolean

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified?: boolean

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'external_url', type: 'text', nullable: true })
  externalUrl?: string

  posts?: InstagramPost[]

  newPosts?: InstagramPost[]

  stories?: InstagramStory[]
}
