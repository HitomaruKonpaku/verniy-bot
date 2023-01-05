import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { TwitterSpace } from './twitter-space.entity'
import { TwitterTweet } from './twitter-tweet.entity'

@Entity('twitter_user')
export class TwitterUser extends BaseExternalEntity {
  @Column({ name: 'updated_at', type: 'numeric', nullable: true })
  updatedAt?: number

  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text', nullable: true })
  name?: string

  @Column({ type: 'text', nullable: true })
  location?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'boolean', default: false })
  protected?: boolean

  @Column({ type: 'boolean', default: false })
  verified?: boolean

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'profile_banner_url', type: 'text', nullable: true })
  profileBannerUrl?: string

  tweets?: TwitterTweet[]

  spaces?: TwitterSpace[]
}
