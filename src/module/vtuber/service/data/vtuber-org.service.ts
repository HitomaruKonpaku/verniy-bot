import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { VtuberOrg } from '../../model/vtuber-org.entity'

@Injectable()
export class VtuberOrgService extends BaseEntityService<VtuberOrg> {
  constructor(
    @InjectRepository(VtuberOrg)
    public readonly repository: Repository<VtuberOrg>,
  ) {
    super()
  }
}
