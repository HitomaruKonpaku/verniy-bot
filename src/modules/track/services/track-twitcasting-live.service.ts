import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitCastingLive } from '../models/track-twitcasting-live.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitCastingLiveService extends TrackBaseService<TrackTwitCastingLive> {
  constructor(
    @InjectRepository(TrackTwitCastingLive)
    public readonly repository: Repository<TrackTwitCastingLive>,
  ) {
    super()
  }

  public async getUserIdsForInit(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('t.user_id')
      .distinct()
      .leftJoin('twitcasting_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getScreenIdsForLiveCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('u.screen_id')
      .distinct()
      .leftJoin('twitcasting_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id NOTNULL')
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
