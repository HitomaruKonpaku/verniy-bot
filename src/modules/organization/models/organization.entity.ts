import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { OrganizationGroup } from './organization-group.entity'
import { OrganizationMember } from './organization-member.entity'

@Entity('organization')
export class Organization {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'text', nullable: true })
  name?: string

  @Column({ name: 'sort_index', type: 'numeric', nullable: true })
  sortIndex?: number

  @OneToMany(() => OrganizationGroup, (v) => v.organization)
  groups?: OrganizationGroup[]

  @OneToMany(() => OrganizationMember, (v) => v.organization)
  members?: OrganizationMember[]
}
