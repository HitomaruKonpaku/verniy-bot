import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitCastingLive } from '../models/track-twitcasting-live.entity'
import { BaseTrackService } from './base/base-track.service'

export class TrackTwitCastingLiveService extends BaseTrackService<TrackTwitCastingLive> {
  constructor(
    @InjectRepository(TrackTwitCastingLive)
    public readonly repository: Repository<TrackTwitCastingLive>,
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
