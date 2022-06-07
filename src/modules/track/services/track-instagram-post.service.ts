import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackInstagramPost } from '../models/track-instagram-post.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackInstagramPostService extends BaseTrackService<TrackInstagramPost> {
  constructor(
    @InjectRepository(TrackInstagramPost)
    public readonly repository: Repository<TrackInstagramPost>,
  ) {
    super()
  }

  public async getUserIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tip')
      .select('tip.user_id')
      .distinct()
      .leftJoin('instagram_user', 'iu', 'iu.id = tip.user_id')
      .andWhere('tip.is_active = TRUE')
      .andWhere('iu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getUsernamesForCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tip')
      .select('iu.username')
      .distinct()
      .leftJoin('instagram_user', 'iu', 'iu.id = tip.user_id')
      .andWhere('tip.is_active = TRUE')
      .andWhere('iu.id NOTNULL')
      .getRawMany()
    const usernames = records.map((v) => v.iu_username)
    return usernames
  }
}
