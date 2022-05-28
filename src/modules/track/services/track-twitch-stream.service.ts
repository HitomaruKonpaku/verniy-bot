import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitchStream } from '../models/track-twitch-stream.entity'
import { BaseTrackService } from './base/base-track.service'

export class TrackTwitchStreamService extends BaseTrackService<TrackTwitchStream> {
  constructor(
    @InjectRepository(TrackTwitchStream)
    public readonly repository: Repository<TrackTwitchStream>,
  ) {
    super()
  }
}
