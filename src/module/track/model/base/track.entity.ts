import { Column, Entity, TableInheritance, Unique } from 'typeorm'
import { BaseEntity } from '../../../database/model/base.entity'
import { TrackType } from '../../enum/track-type.enum'

@Entity('track')
@TableInheritance({ column: { name: 'type', type: 'text' } })
@Unique(['type', 'userId', 'discordChannelId', 'filterUserId'])
export abstract class Track extends BaseEntity {
  @Column({ name: 'type', type: 'text' })
  type: TrackType

  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string

  @Column({ name: 'filter_user_id', type: 'text', default: '' })
  filterUserId: string

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
