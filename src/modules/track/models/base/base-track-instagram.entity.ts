import { Column } from 'typeorm'
import { BaseEntity } from '../../../database/models/base.entity'
import { InstagramUser } from '../../../instagram/models/instagram-user.entity'

export abstract class BaseTrackInstagram extends BaseEntity {
  @Column({ name: 'instagram_user_id', type: 'text' })
  instagramUserId: string

  @Column({ name: 'discord_channel_id', type: 'text' })
  discordChannelId: string

  @Column({ name: 'discord_message', type: 'text', nullable: true })
  discordMessage?: string

  user?: InstagramUser
}
