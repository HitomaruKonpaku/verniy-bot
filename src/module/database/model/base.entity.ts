import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { DB_CURRENT_TIMESTAMP } from '../constant/database.constant'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ name: 'created_at', type: 'numeric', default: () => DB_CURRENT_TIMESTAMP })
  createdAt?: number

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string

  @UpdateDateColumn({ name: 'updated_at', type: 'numeric', default: () => DB_CURRENT_TIMESTAMP })
  updatedAt?: number

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string
}
