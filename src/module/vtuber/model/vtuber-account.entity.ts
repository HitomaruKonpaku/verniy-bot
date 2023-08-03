import { Column, Entity, Index, Unique } from 'typeorm'
import { BaseExternalUserEntity } from '../../database/model/base-external-user.entity'
import { VtuberUser } from './vtuber-user.entity'

@Entity('vtuber_account')
@Unique(['userId', 'accountType', 'accountId'])
export class VtuberAccount extends BaseExternalUserEntity {
  @Column({ name: 'user_id', type: 'text' })
  userId: string

  @Index()
  @Column({ name: 'account_type', type: 'text' })
  accountType: string

  @Column({ name: 'account_id', type: 'text' })
  accountId: string

  user?: VtuberUser
}
