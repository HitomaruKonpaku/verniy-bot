import { Column, Entity } from 'typeorm'
import { BaseExternalEntity } from '../../database/models/base-external.entity'

@Entity('discord_message')
export class DiscordMessage extends BaseExternalEntity {
  @Column({ name: 'author_id', type: 'text' })
  authorId: string

  @Column({ name: 'channel_id', type: 'text', nullable: true })
  channelId?: string

  @Column({ name: 'guild_id', type: 'text', nullable: true })
  guildId?: string

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string
}
