import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterProfile } from '../models/track-twitter-profile.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitterProfileService extends BaseTrackService<TrackTwitterProfile> {
  constructor(
    @InjectRepository(TrackTwitterProfile)
    public readonly repository: Repository<TrackTwitterProfile>,
  ) {
    super()
  }

  public async getTwitterUserIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('twitter_user_id')
      .distinct()
      .andWhere('is_active = TRUE')
      .addOrderBy('LENGTH(twitter_user_id)')
      .addOrderBy('twitter_user_id')
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
