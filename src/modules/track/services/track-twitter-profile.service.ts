import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterProfile } from '../models/track-twitter-profile.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitterProfileService extends BaseTrackService<TrackTwitterProfile> {
  constructor(
    @InjectRepository(TrackTwitterProfile)
    public readonly repository: Repository<TrackTwitterProfile>,
  ) {
    super()
  }

  public async getTwitterUserIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('user_id')
      .distinct()
      .andWhere('is_active = TRUE')
      .addOrderBy('LENGTH(user_id)')
      .addOrderBy('user_id')
      .getRawMany()
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }
}
