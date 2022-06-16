import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTiktokVideo } from '../models/track-tiktok-video.entity'

@Injectable()
export class TrackTiktokVideoService extends TrackService<TrackTiktokVideo> {
  constructor(
    @InjectRepository(TrackTiktokVideo)
    public readonly repository: Repository<TrackTiktokVideo>,
  ) {
    super()
  }
}
