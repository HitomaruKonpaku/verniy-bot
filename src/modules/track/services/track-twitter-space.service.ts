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
    const query = `
SELECT DISTINCT(user_id)
FROM track AS t
  LEFT JOIN twitter_user AS u ON u.id = t.user_id
WHERE t.type = 'twitter_space'
  AND t.is_active = TRUE
  AND u.is_active = TRUE
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }
}
