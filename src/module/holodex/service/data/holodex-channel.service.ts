import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { HolodexChannel } from '../../model/holodex-channel.entity'

@Injectable()
export class HolodexChannelService extends BaseEntityService<HolodexChannel> {
  constructor(
    @InjectRepository(HolodexChannel)
    public readonly repository: Repository<HolodexChannel>,
  ) {
    super()
  }
}
