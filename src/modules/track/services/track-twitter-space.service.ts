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
      .select('tts.twitter_user_id')
      .distinct()
      .leftJoin('twitter_user', 'tu', 'tu.id = tts.twitter_user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.is_active = TRUE')
      .andWhere('tu.protected = FALSE')
      .getRawMany()
    const ids = records.map((v) => v.twitter_user_id) as string[]
    return ids
  }

  public async getManyByTwitterUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async getManyByTwitterUserIds(userIds: string[]) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id IN (:...userIds)', { userIds })
    const records = await query.getMany()
    return records
  }

  public async add(
    twitterUserId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        twitterUserId,
        discordChannelId,
        discordMessage,
      },
      {
        conflictPaths: ['twitterUserId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    twitterUserId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        twitterUserId,
        discordChannelId,
      },
      {
        isActive: false,
        updatedAt: Date.now(),
        updatedBy,
      },
    )
  }
}
