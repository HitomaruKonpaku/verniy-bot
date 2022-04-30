import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('discord_user')
export class DiscordUser {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'created_at', type: 'numeric' })
  createdAt: Date;

  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text' })
  discriminator: string

  @Column({ type: 'text' })
  tag: string
}
