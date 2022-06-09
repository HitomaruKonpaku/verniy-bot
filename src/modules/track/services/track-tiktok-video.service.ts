import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTiktokVideo } from '../models/track-tiktok-video.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTiktokVideoService extends BaseTrackService<TrackTiktokVideo> {
  constructor(
    @InjectRepository(TrackTiktokVideo)
    public readonly repository: Repository<TrackTiktokVideo>,
  ) {
    super()
  }

  public async getUserIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttv')
      .select('ttv.user_id')
      .distinct()
      .leftJoin('tiktok_user', 'tu', 'tu.id = ttv.user_id')
      .andWhere('ttv.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getUsernamesForCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttv')
      .select('tu.username')
      .distinct()
      .leftJoin('tiktok_user', 'tu', 'tu.id = ttv.user_id')
      .andWhere('ttv.is_active = TRUE')
      .andWhere('tu.id NOTNULL')
      .getRawMany()
    const usernames = records.map((v) => v.tu_username)
    return usernames
  }
}
