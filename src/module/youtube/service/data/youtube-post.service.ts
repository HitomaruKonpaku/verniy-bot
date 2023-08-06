import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { YoutubePost } from '../../model/youtube-post.entity'

@Injectable()
export class YoutubePostService extends BaseEntityService<YoutubePost> {
  constructor(
    @InjectRepository(YoutubePost)
    public readonly repository: Repository<YoutubePost>,
  ) {
    super()
  }
}
