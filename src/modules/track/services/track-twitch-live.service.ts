import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTwitchLive } from '../models/track-twitch-live.entity'

@Injectable()
export class TrackTwitchLiveService extends TrackService<TrackTwitchLive> {
  constructor(
    @InjectRepository(TrackTwitchLive)
    public readonly repository: Repository<TrackTwitchLive>,
  ) {
    super()
  }
}
