import { Column, PrimaryColumn } from 'typeorm'
import { DB_CURRENT_TIMESTAMP } from '../constants/database.constant'

export abstract class BaseExternalEntity {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'created_at', type: 'numeric', default: () => DB_CURRENT_TIMESTAMP })
  createdAt?: number
}
