import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'

@Entity('discord_guild')
export class DiscordGuild extends BaseExternalEntity {
  @Column({ name: 'owner_id', type: 'text' })
  ownerId: string

  @Column({ type: 'text' })
  name: string

  @Column({ name: 'joined_at', type: 'numeric', nullable: true })
  joinedAt?: number

  @Column({ name: 'left_at', type: 'numeric', nullable: true })
  leftAt?: number
}
