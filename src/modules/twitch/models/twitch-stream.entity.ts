import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'
import { TwitchUser } from './twitch-user.entity'

@Entity('twitch_stream')
export class TwitchStream extends BaseExternalEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Column({ name: 'game_id', type: 'text', nullable: true })
  gameId?: string

  @Column({ name: 'type', type: 'text', nullable: true })
  type?: string

  @Column({ name: 'title', type: 'text', nullable: true })
  title?: string

  @Column({ name: 'is_mature', type: 'boolean', default: false })
  isMature?: boolean

  user?: TwitchUser
}
