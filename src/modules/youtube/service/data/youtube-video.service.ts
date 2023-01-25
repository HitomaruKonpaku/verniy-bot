import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { YoutubeVideo } from '../../model/youtube-video.entity'

@Injectable()
export class YoutubeVideoService extends BaseEntityService<YoutubeVideo> {
  constructor(
    @InjectRepository(YoutubeVideo)
    public readonly repository: Repository<YoutubeVideo>,
  ) {
    super()
  }
}
