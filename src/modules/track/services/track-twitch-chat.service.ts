import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitchChat } from '../models/track-twitch-chat.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitchChatService extends TrackBaseService<TrackTwitchChat> {
  constructor(
    @InjectRepository(TrackTwitchChat)
    public readonly repository: Repository<TrackTwitchChat>,
  ) {
    super()
  }

  public async getUsernamesForChatCheck(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('t')
      .select('u.username')
      .distinct()
      .leftJoin('twitch_user', 'u', 'u.id = t.user_id')
      .andWhere('t.is_active = TRUE')
      .andWhere('u.id NOTNULL')
      .getRawMany()
    const ids = records.map((v) => v.u_username)
    return ids
  }
}
