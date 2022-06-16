import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTwitterProfile } from '../models/track-twitter-profile.entity'

@Injectable()
export class TrackTwitterProfileService extends TrackService<TrackTwitterProfile> {
  constructor(
    @InjectRepository(TrackTwitterProfile)
    public readonly repository: Repository<TrackTwitterProfile>,
  ) {
    super()
  }
}
