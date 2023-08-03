import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { HolodexVideo } from '../../model/holodex-video.entity'

@Injectable()
export class HolodexVideoService extends BaseEntityService<HolodexVideo> {
  constructor(
    @InjectRepository(HolodexVideo)
    public readonly repository: Repository<HolodexVideo>,
  ) {
    super()
  }
}
