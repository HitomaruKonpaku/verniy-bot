import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterSpace } from '../models/track-twitter-space.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitterSpaceService extends TrackBaseService<TrackTwitterSpace> {
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
