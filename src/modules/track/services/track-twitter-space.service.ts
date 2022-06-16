import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTwitterSpace } from '../models/track-twitter-space.entity'

@Injectable()
export class TrackTwitterSpaceService extends TrackService<TrackTwitterSpace> {
  constructor(
    @InjectRepository(TrackTwitterSpace)
    public readonly repository: Repository<TrackTwitterSpace>,
  ) {
    super()
  }
}
