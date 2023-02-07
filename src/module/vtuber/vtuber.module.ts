import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VtuberGroupMember } from './model/vtuber-group-member.entity'
import { VtuberGroup } from './model/vtuber-group.entity'
import { VtuberOrg } from './model/vtuber-org.entity'
import { VtuberUser } from './model/vtuber-user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VtuberUser,
      VtuberOrg,
      VtuberGroup,
      VtuberGroupMember,
    ]),
  ],
  providers: [
  ],
  exports: [
  ],
})
export class VtuberModule { }
