import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackYoutubeLive } from '../models/track-youtube-live.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackYoutubeLiveService extends TrackBaseService<TrackYoutubeLive> {
  constructor(
    @InjectRepository(TrackYoutubeLive)
    public readonly repository: Repository<TrackYoutubeLive>,
  ) {
    super()
  }
}
