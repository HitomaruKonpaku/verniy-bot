import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { VtuberAccount } from '../../model/vtuber-account.entity'

@Injectable()
export class VtuberAccountService extends BaseEntityService<VtuberAccount> {
  constructor(
    @InjectRepository(VtuberAccount)
    public readonly repository: Repository<VtuberAccount>,
  ) {
    super()
  }
}
