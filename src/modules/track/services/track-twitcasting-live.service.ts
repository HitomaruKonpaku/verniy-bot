import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitCastingLive } from '../models/track-twitcasting-live.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitCastingLiveService extends BaseTrackService<TrackTwitCastingLive> {
  constructor(
    @InjectRepository(TrackTwitCastingLive)
    public readonly repository: Repository<TrackTwitCastingLive>,
  ) {
    super()
  }

  public async getIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttl')
      .select('ttl.twitcasting_user_id')
      .distinct()
      .leftJoin('twitcasting_user', 'tu', 'tu.id = ttl.twitcasting_user_id')
      .andWhere('ttl.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.twitcasting_user_id)
    return ids
  }

  public async getScreenIdsForLiveCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('ttl')
      .select('tu.screen_id')
      .distinct()
      .leftJoin('twitcasting_user', 'tu', 'tu.id = ttl.twitcasting_user_id')
      .andWhere('ttl.is_active = TRUE')
      .andWhere('tu.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.screen_id)
    return ids
  }

  public async getManyByTwitCastingUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitcasting_user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async add(
    twitcastingUserId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        twitcastingUserId,
        discordChannelId,
        discordMessage,
      },
      {
        conflictPaths: ['twitcastingUserId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    twitcastingUserId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        twitcastingUserId,
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
