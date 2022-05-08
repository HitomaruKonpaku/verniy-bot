import { Column, Entity } from 'typeorm'
import { BaseEntity } from './_base.entity'

@Entity('discord_user')
export class DiscordUser extends BaseEntity {
  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text' })
  discriminator: string

  @Column({ type: 'text' })
  tag: string
}
