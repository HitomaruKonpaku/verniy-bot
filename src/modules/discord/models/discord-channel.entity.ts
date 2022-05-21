import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base/base-external.entity'

@Entity('discord_channel')
export class DiscordChannel extends BaseExternalEntity {
  @Column({ name: 'guild_id', type: 'text', nullable: true })
  guildId?: string

  @Column({ type: 'text' })
  name: string
}
