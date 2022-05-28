import { Column } from 'typeorm'
import { BaseEntity } from '../../../database/models/base.entity'
import { TwitCastingUser } from '../../../twitcasting/models/twitcasting-user.entity'

export abstract class BaseTrackTwitCasting extends BaseEntity {
  @Column({ name: 'twitcasting_user_id', type: 'text' })
  twitcastingUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string

  user?: TwitCastingUser
}
