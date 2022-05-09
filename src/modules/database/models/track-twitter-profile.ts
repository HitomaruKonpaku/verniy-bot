import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from './base/base.entity'

@Entity('track_twitter_profile')
@Unique(['twitterUserId', 'discordChannelId'])
export class TrackTwitterProfile extends BaseEntity {
  @Column({ name: 'twitter_user_id', type: 'text' })
  twitterUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string
}
