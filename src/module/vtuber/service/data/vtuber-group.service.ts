import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { VtuberGroup } from '../../model/vtuber-group.entity'

@Injectable()
export class VtuberGroupService extends BaseEntityService<VtuberGroup> {
  constructor(
    @InjectRepository(VtuberGroup)
    public readonly repository: Repository<VtuberGroup>,
  ) {
    super()
  }
}
