import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VtuberAccount } from './model/vtuber-account.entity'
import { VtuberGroupMember } from './model/vtuber-group-member.entity'
import { VtuberGroup } from './model/vtuber-group.entity'
import { VtuberOrg } from './model/vtuber-org.entity'
import { VtuberUser } from './model/vtuber-user.entity'
import { VtuberAccountService } from './service/data/vtuber-account.service'
import { VtuberGroupMemberService } from './service/data/vtuber-group-member.service'
import { VtuberGroupService } from './service/data/vtuber-group.service'
import { VtuberOrgService } from './service/data/vtuber-org.service'
import { VtuberUserService } from './service/data/vtuber-user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VtuberUser,
      VtuberAccount,
      VtuberOrg,
      VtuberGroup,
      VtuberGroupMember,
    ]),
  ],
  providers: [
    VtuberUserService,
    VtuberAccountService,
    VtuberOrgService,
    VtuberGroupService,
    VtuberGroupMemberService,
  ],
  exports: [
    VtuberUserService,
    VtuberAccountService,
    VtuberOrgService,
    VtuberGroupService,
    VtuberGroupMemberService,
  ],
})
export class VtuberModule { }
