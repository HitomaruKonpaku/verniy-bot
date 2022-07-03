import {
  Column,
  Entity,
  TableInheritance,
  Unique,
} from 'typeorm'
import { BaseEntity } from '../../database/models/base.entity'
import { TrackType } from '../enums/track-type.enum'

@Entity('track')
@TableInheritance({ column: { name: 'type', type: 'text' } })
@Unique(['type', 'userId', 'discordChannelId'])
export abstract class Track extends BaseEntity {
  @Column({ name: 'type', type: 'text' })
  type: TrackType

  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string
}
