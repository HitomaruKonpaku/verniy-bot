import { Column } from 'typeorm'
import { BaseEntity } from '../../../database/models/base.entity'
import { TwitchUser } from '../../../twitch/models/twitch-user.entity'

export abstract class BaseTrackTwitch extends BaseEntity {
  @Column({ name: 'twitch_user_id', type: 'text' })
  twitchUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string

  user?: TwitchUser
}
