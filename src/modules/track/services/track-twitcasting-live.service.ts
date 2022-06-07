import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitCastingLive } from '../models/track-twitcasting-live.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitCastingLiveService extends BaseTrackService<TrackTwitCastingLive> {
  constructor(
    @InjectRepository(TrackTwitCastingLive)
    public readonly repository: Repository<TrackTwitCastingLive>,
  ) {
    super()
  }

  public async getUserIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttl')
      .select('ttl.user_id')
      .distinct()
      .leftJoin('twitcasting_user', 'tu', 'tu.id = ttl.user_id')
      .andWhere('ttl.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getScreenIdsForLiveCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttl')
      .select('tu.screen_id')
      .distinct()
      .leftJoin('twitcasting_user', 'tu', 'tu.id = ttl.user_id')
      .andWhere('ttl.is_active = TRUE')
      .andWhere('tu.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.screen_id)
    return ids
  }

  public async filterExistedUserIds(userIds: string[]): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder()
      .select('user_id')
      .distinct()
      .andWhere('is_active = TRUE')
      .andWhere('user_id IN (:...userIds)', { userIds })
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }
}
