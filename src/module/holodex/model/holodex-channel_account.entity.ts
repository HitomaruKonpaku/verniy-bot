import { Column, Entity, Index, Unique } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { HolodexChannel } from './holodex-channel.entity'

@Entity('holodex_channel_account')
@Unique(['channelId', 'accountType', 'accountId'])
export class HolodexChannelAccount extends BaseExternalUserEntity {
  @Column({ name: 'channel_id', type: 'text' })
  channelId: string

  @Index()
  @Column({ name: 'account_type', type: 'text' })
  accountType: string

  @Column({ name: 'account_id', type: 'text' })
  accountId: string

  channel?: HolodexChannel
}
