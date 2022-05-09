import { Column, PrimaryColumn } from 'typeorm'

export abstract class BaseExternalEntity {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'created_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
