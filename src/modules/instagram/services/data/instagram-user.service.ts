import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { InstagramUser } from '../../models/instagram-user.entity'

@Injectable()
export class InstagramUserService extends BaseEntityService<InstagramUser> {
  constructor(
    @InjectRepository(InstagramUser)
    public readonly repository: Repository<InstagramUser>,
  ) {
    super()
  }
}
