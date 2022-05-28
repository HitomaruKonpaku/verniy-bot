import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitchStream } from '../models/track-twitch-stream.entity'
import { BaseTrackService } from './base/base-track.service'

export class TrackTwitchStreamService extends BaseTrackService<TrackTwitchStream> {
  constructor(
    @InjectRepository(TrackTwitchStream)
    public readonly repository: Repository<TrackTwitchStream>,
  ) {
    super()
  }

  public async getUserIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tts')
      .select('tts.twitch_user_id')
      .distinct()
      .leftJoin('twitch_user', 'tu', 'tu.id = tts.twitch_user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.twitch_user_id)
    return ids
  }

  public async getUserIdsForStreamCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tts')
      .select('tts.twitch_user_id')
      .distinct()
      .leftJoin('twitch_user', 'tu', 'tu.id = tts.twitch_user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.twitch_user_id)
    return ids
  }

  public async getManyByTwitchUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitch_user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async add(
    twitchUserId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        twitchUserId,
        discordChannelId,
        discordMessage,
      },
      {
        conflictPaths: ['twitchUserId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    twitchUserId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        twitchUserId,
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
