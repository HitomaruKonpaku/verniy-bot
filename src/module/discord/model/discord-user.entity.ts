import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/model/base-external.entity'

@Entity('discord_user')
export class DiscordUser extends BaseExternalEntity {
  @Column({ type: 'text' })
  username: string

  @Column({ type: 'text' })
  discriminator: string

  @Column({ type: 'text' })
  tag: string
}
