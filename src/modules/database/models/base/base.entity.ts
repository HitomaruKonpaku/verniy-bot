import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive?: boolean

  @CreateDateColumn({ name: 'created_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string

  @UpdateDateColumn({ name: 'updated_at', type: 'numeric', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string
}
