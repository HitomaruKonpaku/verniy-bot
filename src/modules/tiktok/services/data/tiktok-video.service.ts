import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TiktokVideo } from '../../models/tiktok-video.entity'

@Injectable()
export class TiktokVideoService extends BaseEntityService<TiktokVideo> {
  constructor(
    @InjectRepository(TiktokVideo)
    public readonly repository: Repository<TiktokVideo>,
  ) {
    super()
  }
}
