import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTwitCastingLive } from '../models/track-twitcasting-live.entity'

@Injectable()
export class TrackTwitCastingLiveService extends TrackService<TrackTwitCastingLive> {
  constructor(
    @InjectRepository(TrackTwitCastingLive)
    public readonly repository: Repository<TrackTwitCastingLive>,
  ) {
    super()
  }
}
