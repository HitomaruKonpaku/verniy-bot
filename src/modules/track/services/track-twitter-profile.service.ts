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

  public async getUserIds() {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('t.user_id')
      .distinct()
      .andWhere('t.is_active = TRUE')
      .addOrderBy('LENGTH(t.user_id)')
      .addOrderBy('t.user_id')
      .getRawMany()
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }
}
