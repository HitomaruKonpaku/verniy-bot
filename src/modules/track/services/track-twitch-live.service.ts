import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackService } from '../base/track.service'
import { TrackTwitchLive } from '../models/track-twitch-live.entity'

@Injectable()
export class TrackTwitchLiveService extends TrackService<TrackTwitchLive> {
  constructor(
    @InjectRepository(TrackTwitchLive)
    public readonly repository: Repository<TrackTwitchLive>,
  ) {
    super()
  }

  public async getUserIdsForInit(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('t.user_id')
      .distinct()
      .leftJoin('twitch_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getUserIdsForLiveCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('t.user_id')
      .distinct()
      .leftJoin('twitch_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }
}
