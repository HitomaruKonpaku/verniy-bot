import { Column } from 'typeorm'
import { BaseExternalEntity } from './base-external.entity'

export abstract class BaseExternalUserEntity extends BaseExternalEntity {
  @Column({ name: 'is_retired', type: 'boolean', default: false })
  isRetired?: boolean
}
