import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { DB_CURRENT_TIMESTAMP } from '../../database/constant/database.constant'

@Entity('history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at', type: 'numeric', default: () => DB_CURRENT_TIMESTAMP })
  createdAt?: number

  @Index()
  @Column({ name: 'entity', type: 'text' })
  entity: string

  @Column({ name: 'entity_id', type: 'text' })
  entityId: string

  @Index()
  @Column({ name: 'field', type: 'text' })
  field: string

  @Index()
  @Column({ name: 'type', type: 'text', nullable: true })
  type?: string

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue?: string

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue?: string
}
