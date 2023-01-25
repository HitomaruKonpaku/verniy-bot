import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterProfile } from '../model/track-twitter-profile.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitterProfileService extends TrackBaseService<TrackTwitterProfile> {
  constructor(
    @InjectRepository(TrackTwitterProfile)
    public readonly repository: Repository<TrackTwitterProfile>,
  ) {
    super()
  }

  public async getUserIds() {
    const query = `
SELECT DISTINCT(user_id)
FROM track AS t
WHERE t.type = 'twitter_profile'
  AND t.is_active = TRUE
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }
}
