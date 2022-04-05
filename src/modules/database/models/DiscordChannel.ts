import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('discord_channel')
export class DiscordChannel {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'created_at', type: 'numeric' })
  createdAt: Date;

  @Column({ name: 'guild_id', type: 'text', nullable: true })
  guildId?: string

  @Column({ type: 'text', nullable: true })
  name?: string
}
