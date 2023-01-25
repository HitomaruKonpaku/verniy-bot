import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { InstagramPost } from '../../model/instagram-post.entity'

@Injectable()
export class InstagramPostService extends BaseEntityService<InstagramPost> {
  constructor(
    @InjectRepository(InstagramPost)
    public readonly repository: Repository<InstagramPost>,
  ) {
    super()
  }
}
