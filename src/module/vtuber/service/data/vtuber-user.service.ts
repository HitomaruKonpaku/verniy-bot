import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { VtuberUser } from '../../model/vtuber-user.entity'

@Injectable()
export class VtuberUserService extends BaseEntityService<VtuberUser> {
  constructor(
    @InjectRepository(VtuberUser)
    public readonly repository: Repository<VtuberUser>,
  ) {
    super()
  }
}
