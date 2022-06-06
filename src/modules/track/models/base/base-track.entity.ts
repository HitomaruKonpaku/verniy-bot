import { Column } from 'typeorm'
import { BaseEntity } from '../../../database/models/base.entity'

export abstract class BaseTrackEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string
}
