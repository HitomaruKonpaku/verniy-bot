import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('organization_group_member')
export class OrganizationGroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'group_id', type: 'text' })
  groupId: string

  @Column({ name: 'member_id', type: 'text' })
  memberId: string

  @Column({ name: 'sort_index', type: 'numeric', nullable: true })
  sortIndex?: number
}
