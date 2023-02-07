import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VtuberOrgMember } from './model/vtuber-org-member.entity'
import { VtuberOrg } from './model/vtuber-org.entity'
import { VtuberUser } from './model/vtuber-user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VtuberUser,
      VtuberOrg,
      VtuberOrgMember,
    ]),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class VtuberModule { }
