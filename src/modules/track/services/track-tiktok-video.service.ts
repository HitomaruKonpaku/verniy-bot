import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTiktokVideo } from '../models/track-tiktok-video.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTiktokVideoService extends TrackBaseService<TrackTiktokVideo> {
  constructor(
    @InjectRepository(TrackTiktokVideo)
    public readonly repository: Repository<TrackTiktokVideo>,
  ) {
    super()
  }

  public async getUsernamesForCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('u.username')
      .distinct()
      .leftJoin('tiktok_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id NOTNULL')
      .getRawMany()
    const usernames = records.map((v) => v.u_username)
    return usernames
  }
}
