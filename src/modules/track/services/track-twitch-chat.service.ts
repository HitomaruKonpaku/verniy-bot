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
    const query = `
SELECT DISTINCT(username)
FROM track AS t
  LEFT JOIN twitch_user AS u ON u.id = t.user_id
WHERE t.type = 'twitch_chat'
  AND t.is_active = TRUE
  AND u.id NOTNULL
ORDER BY t.created_at
    `
    const records = await this.repository.query(query)
    const usernames = records.map((v) => v.username)
    return usernames
  }
}
