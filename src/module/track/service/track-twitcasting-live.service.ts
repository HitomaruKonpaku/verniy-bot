import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitCastingLive } from '../model/track-twitcasting-live.entity'
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
    const query = `
SELECT DISTINCT(user_id)
FROM track AS t
  LEFT JOIN twitcasting_user AS u ON u.id = t.user_id
WHERE t.type = 'twitcasting_live'
  AND t.is_active = TRUE
  AND u.id ISNULL
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getScreenIdsForLiveCheck(): Promise<string[]> {
    const query = `
SELECT DISTINCT(screen_id)
FROM track AS t
  LEFT JOIN twitcasting_user AS u ON u.id = t.user_id
WHERE t.type = 'twitcasting_live'
  AND t.is_active = TRUE
  AND u.id NOTNULL
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
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
