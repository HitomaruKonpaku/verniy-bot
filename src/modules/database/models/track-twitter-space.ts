import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from './base/base.entity'

@Entity('track_twitter_space')
@Unique(['twitterUserId', 'discordChannelId'])
export class TrackTwitterSpace extends BaseEntity {
  @Column({ name: 'twitter_user_id', type: 'text' })
  twitterUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string
}
