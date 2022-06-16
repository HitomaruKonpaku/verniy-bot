import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackInstagramPost } from '../models/track-instagram-post.entity'

@Injectable()
export class TrackInstagramPostService extends TrackService<TrackInstagramPost> {
  constructor(
    @InjectRepository(TrackInstagramPost)
    public readonly repository: Repository<TrackInstagramPost>,
  ) {
    super()
  }
}
