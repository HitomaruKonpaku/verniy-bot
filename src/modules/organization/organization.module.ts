import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationGroupMember } from './models/organization-group-member.entity'
import { OrganizationGroup } from './models/organization-group.entity'
import { OrganizationMember } from './models/organization-member.entity'
import { Organization } from './models/organization.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationGroup,
      OrganizationMember,
      OrganizationGroupMember,
    ]),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class OrganizationModule { }
