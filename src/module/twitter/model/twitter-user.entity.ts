import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { TwitterSpace } from './twitter-space.entity'
import { TwitterTweet } from './twitter-tweet.entity'

@Entity('twitter_user')
export class TwitterUser extends BaseExternalUserEntity {
  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text', nullable: true })
  name?: string

  @Column({ type: 'boolean', default: false })
  protected?: boolean

  @Column({ type: 'boolean', default: false })
  verified?: boolean

  @Column({ name: 'verified_type', type: 'text', nullable: true })
  verifiedType?: string

  @Column({ type: 'text', nullable: true })
  location?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'profile_banner_url', type: 'text', nullable: true })
  profileBannerUrl?: string

  @Column({ name: 'followers_count', type: 'numeric', nullable: true })
  followersCount?: number

  @Column({ name: 'following_count', type: 'numeric', nullable: true })
  followingCount?: number

  @Column({ name: 'tweet_count', type: 'numeric', nullable: true })
  tweetCount?: number

  @Column({ name: 'organization_id', type: 'text', nullable: true })
  organizationId?: string

  @Column({ name: 'affiliates_count', type: 'numeric', nullable: true })
  affiliatesCount?: number

  tweets?: TwitterTweet[]

  spaces?: TwitterSpace[]
}
