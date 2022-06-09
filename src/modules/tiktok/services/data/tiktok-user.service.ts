import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TiktokUser } from '../../models/tiktok-user.entity'

@Injectable()
export class TiktokUserService extends BaseEntityService<TiktokUser> {
  constructor(
    @InjectRepository(TiktokUser)
    public readonly repository: Repository<TiktokUser>,
  ) {
    super()
  }
}
