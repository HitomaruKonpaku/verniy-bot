import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackInstagramPost } from '../models/track-instagram-post.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackInstagramPostService extends BaseTrackService<TrackInstagramPost> {
  constructor(
    @InjectRepository(TrackInstagramPost)
    public readonly repository: Repository<TrackInstagramPost>,
  ) {
    super()
  }

  public async getUserIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tip')
      .select('tip.instagram_user_id')
      .distinct()
      .leftJoin('instagram_user', 'iu', 'iu.id = tip.instagram_user_id')
      .andWhere('tip.is_active = TRUE')
      .andWhere('iu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.instagram_user_id)
    return ids
  }

  public async getUsernamesForCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tip')
      .select('iu.username')
      .distinct()
      .leftJoin('instagram_user', 'iu', 'iu.id = tip.instagram_user_id')
      .andWhere('tip.is_active = TRUE')
      .andWhere('iu.id NOTNULL')
      .getRawMany()
    const usernames = records.map((v) => v.iu_username)
    return usernames
  }

  public async getManyByInstagramUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('instagram_user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async add(
    instagramUserId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        instagramUserId,
        discordChannelId,
        discordMessage,
      },
      {
        conflictPaths: ['instagramUserId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    instagramUserId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        instagramUserId,
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
