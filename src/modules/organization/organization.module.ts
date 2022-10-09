import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationGroup } from './models/organization-group.entity'
import { OrganizationMember } from './models/organization-member.entity'
import { Organization } from './models/organization.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationGroup,
      OrganizationMember,
    ]),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class OrganizationModule { }
