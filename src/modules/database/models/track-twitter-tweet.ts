import { Column, Entity, Unique } from 'typeorm'
import { BaseEntity } from './base/base.entity'

@Entity('track_twitter_tweet')
@Unique(['twitterUserId', 'discordChannelId'])
export class TrackTwitterTweet extends BaseEntity {
  @Column({ name: 'twitter_user_id', type: 'text' })
  twitterUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'allow_reply', type: 'boolean', default: true })
  allowReply: boolean

  @Column({ name: 'allow_retweet', type: 'boolean', default: true })
  allowRetweet: boolean

  @Column({
    name: 'filter_keywords',
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: string[]) => (Array.isArray(value) ? JSON.stringify(value) : null),
      from: (value: string) => JSON.parse(value),
    },
  })
  filterKeywords?: string[]
}
