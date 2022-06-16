import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackInstagramProfile } from '../models/track-instagram-profile.entity'

@Injectable()
export class TrackInstagramProfileService extends TrackService<TrackInstagramProfile> {
  constructor(
    @InjectRepository(TrackInstagramProfile)
    public readonly repository: Repository<TrackInstagramProfile>,
  ) {
    super()
  }
}
