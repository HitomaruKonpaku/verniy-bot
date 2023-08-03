import { Column, Entity, Index } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { HolodexChannelType } from '../enum/holodex-channel-type.enum'
import { HolodexChannelAccount } from './holodex-channel_account.entity'
import { HolodexVideo } from './holodex-video.entity'

@Entity('holodex_channel')
export class HolodexChannel extends BaseExternalUserEntity {
  @Index()
  @Column({ name: 'type', type: 'text' })
  type: HolodexChannelType

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string

  @Column({ name: 'org', type: 'text', nullable: true })
  org?: string

  @Column({ name: 'suborg', type: 'text', nullable: true })
  suborg?: string

  @Column({ name: 'group', type: 'text', nullable: true })
  group?: string

  accounts?: HolodexChannelAccount[]

  video?: HolodexVideo[]
}
