import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackInstagramPost } from '../models/track-instagram-post.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackInstagramPostService extends TrackBaseService<TrackInstagramPost> {
  constructor(
    @InjectRepository(TrackInstagramPost)
    public readonly repository: Repository<TrackInstagramPost>,
  ) {
    super()
  }
}
