import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackInstagramProfile } from '../models/track-instagram-profile.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackInstagramProfileService extends TrackBaseService<TrackInstagramProfile> {
  constructor(
    @InjectRepository(TrackInstagramProfile)
    public readonly repository: Repository<TrackInstagramProfile>,
  ) {
    super()
  }
}
