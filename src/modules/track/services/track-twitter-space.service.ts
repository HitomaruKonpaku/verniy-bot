import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterSpace } from '../models/track-twitter-space.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitterSpaceService extends BaseTrackService<TrackTwitterSpace> {
  constructor(
    @InjectRepository(TrackTwitterSpace)
    public readonly repository: Repository<TrackTwitterSpace>,
  ) {
    super()
  }

  public async getTwitterUserIds() {
    const records = await this.repository
      .createQueryBuilder('tts')
      .select('tts.user_id')
      .distinct()
      .leftJoin('twitter_user', 'tu', 'tu.id = tts.user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.is_active = TRUE')
      .andWhere('tu.protected = FALSE')
      .getRawMany()
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }

  public async getManyByTwitterUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async getManyByTwitterUserIds(userIds: string[]) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id IN (:...userIds)', { userIds })
    const records = await query.getMany()
    return records
  }
}
