import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TwitchStream } from '../../models/twitch-stream.entity'

@Injectable()
export class TwitchStreamService extends BaseEntityService<TwitchStream> {
  constructor(
    @InjectRepository(TwitchStream)
    public readonly repository: Repository<TwitchStream>,
  ) {
    super()
  }
}
