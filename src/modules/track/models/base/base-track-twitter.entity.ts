import { Column } from 'typeorm'
import { BaseEntity } from '../../../database/models/base.entity'

export abstract class BaseTrackTwitter extends BaseEntity {
  @Column({ name: 'twitter_user_id', type: 'text' })
  twitterUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string
}
