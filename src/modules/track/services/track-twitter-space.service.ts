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

  public async getUserIds() {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('t.user_id')
      .distinct()
      .leftJoin('twitter_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.is_active = TRUE')
      // .andWhere('u.protected = FALSE')
      .getRawMany()
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }
}
