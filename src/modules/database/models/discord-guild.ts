import { Column, Entity } from 'typeorm'
import { BaseEntity } from './_base.entity'

@Entity('discord_guild')
export class DiscordGuild extends BaseEntity {
  @Column({ name: 'owner_id', type: 'text' })
  ownerId: string

  @Column({ type: 'text' })
  name: string

  @Column({ name: 'joined_at', type: 'numeric', nullable: true })
  joinedAt?: Date

  @Column({ name: 'left_at', type: 'numeric', nullable: true })
  leftAt?: Date
}
