import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitchStream } from '../models/track-twitch-stream.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
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
      .select('tts.user_id')
      .distinct()
      .leftJoin('twitch_user', 'tu', 'tu.id = tts.user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }

  public async getUserIdsForStreamCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tts')
      .select('tts.user_id')
      .distinct()
      .leftJoin('twitch_user', 'tu', 'tu.id = tts.user_id')
      .andWhere('tts.is_active = TRUE')
      .andWhere('tu.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.user_id)
    return ids
  }
}
