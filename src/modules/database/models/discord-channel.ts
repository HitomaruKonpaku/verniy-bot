import { Column, Entity } from 'typeorm'
import { BaseEntity } from './_base.entity'

@Entity('discord_channel')
export class DiscordChannel extends BaseEntity {
  @Column({ name: 'guild_id', type: 'text', nullable: true })
  guildId?: string

  @Column({ type: 'text' })
  name: string
}
