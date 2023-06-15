import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { VtuberGroupMember } from '../../model/vtuber-group-member.entity'

@Injectable()
export class VtuberGroupMemberService extends BaseEntityService<VtuberGroupMember> {
  constructor(
    @InjectRepository(VtuberGroupMember)
    public readonly repository: Repository<VtuberGroupMember>,
  ) {
    super()
  }
}
