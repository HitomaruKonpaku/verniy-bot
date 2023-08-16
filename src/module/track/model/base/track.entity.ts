import { Column, Entity, Index, TableInheritance, Unique } from 'typeorm'
import { BaseEntity } from '../../../database/model/base.entity'
import { dbArrayTransformer } from '../../../database/transformer/transformer'
import { TrackType } from '../../enum/track-type.enum'

@Entity('track')
@TableInheritance({ column: { name: 'type', type: 'text' } })
@Unique(['type', 'userId', 'discordChannelId', 'filterUserId'])
export abstract class Track extends BaseEntity {
  @Index()
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
    transformer: dbArrayTransformer,
  })
  filterKeywords?: string[]
}
