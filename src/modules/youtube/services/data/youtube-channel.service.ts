import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { YoutubeChannel } from '../../models/youtube-channel.entity'

@Injectable()
export class YoutubeChannelService extends BaseEntityService<YoutubeChannel> {
  constructor(
    @InjectRepository(YoutubeChannel)
    public readonly repository: Repository<YoutubeChannel>,
  ) {
    super()
  }
}
