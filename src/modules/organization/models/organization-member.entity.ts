import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Organization } from './organization.entity'

@Entity('organization_member')
export class OrganizationMember {
  @PrimaryColumn({ type: 'text' })
  id: string

  @Column({ name: 'organization_id', type: 'text' })
  organizationId: string

  @Column({ type: 'text', nullable: true })
  name?: string

  @ManyToOne(() => Organization, (v) => v.members)
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization
}
