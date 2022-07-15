import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitchLive } from '../models/track-twitch-live.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitchLiveService extends TrackBaseService<TrackTwitchLive> {
  constructor(
    @InjectRepository(TrackTwitchLive)
    public readonly repository: Repository<TrackTwitchLive>,
  ) {
    super()
  }

  public async getUserIdsForInit(): Promise<string[]> {
    const query = `
SELECT DISTINCT(user_id)
FROM track AS t
  LEFT JOIN twitch_user AS u ON u.id = t.user_id
WHERE t.type = 'twitch_live'
  AND t.is_active = TRUE
  AND u.id ISNULL
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getUserIdsForLiveCheck(): Promise<string[]> {
    const query = `
SELECT DISTINCT(user_id)
FROM track AS t
  LEFT JOIN twitch_user AS u ON u.id = t.user_id
WHERE t.type = 'twitch_live'
  AND t.is_active = TRUE
  AND u.id NOTNULL
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.user_id)
    return ids
  }
}
