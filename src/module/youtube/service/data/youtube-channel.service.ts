import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { YoutubeChannel } from '../../model/youtube-channel.entity'

@Injectable()
export class YoutubeChannelService extends BaseEntityService<YoutubeChannel> {
  constructor(
    @InjectRepository(YoutubeChannel)
    public readonly repository: Repository<YoutubeChannel>,
  ) {
    super()
  }
}
