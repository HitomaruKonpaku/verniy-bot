import { Column, Entity } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/models/base-external-user.entity'
import { TwitchStream } from './twitch-stream.entity'

@Entity('twitch_user')
export class TwitchUser extends BaseExternalUserEntity {
  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'display_name', type: 'text', nullable: true })
  displayName?: string

  @Column({ name: 'type', type: 'text', nullable: true })
  type?: string

  @Column({ name: 'broadcaster_type', type: 'text', nullable: true })
  broadcasterType?: string

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string

  @Column({ name: 'offline_image_url', type: 'text', nullable: true })
  offlineImageUrl?: string

  streams?: TwitchStream[]
}
