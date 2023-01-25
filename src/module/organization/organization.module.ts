import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationGroupMember } from './model/organization-group-member.entity'
import { OrganizationGroup } from './model/organization-group.entity'
import { OrganizationMember } from './model/organization-member.entity'
import { Organization } from './model/organization.entity'

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
