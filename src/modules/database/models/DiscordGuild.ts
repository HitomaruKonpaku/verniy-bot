import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('discord_guild')
export class DiscordGuild {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'created_at', type: 'numeric' })
  createdAt: Date;

  @Column({ type: 'text' })
  name: string
}
