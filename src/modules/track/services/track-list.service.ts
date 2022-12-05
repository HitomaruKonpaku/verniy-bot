import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Track } from '../models/base/track.entity'

@Injectable()
export class TrackListService {
  constructor(
    @InjectRepository(Track)
    public readonly repository: Repository<Track>,
  ) { }

  public async getManyByDiscordChannelId(discordChannelId: string) {
    const query = `
SELECT t.id,
  t.is_active,
  t.type,
  t.user_id,
  t.filter_user_id,
  COALESCE(
    u1.username,
    u2.screen_id,
    u3.username,
    u4.username,
    u5.username
  ) AS username,
  COALESCE(
    fu1.username,
    fu2.screen_id,
    fu3.username,
    fu4.username,
    fu5.username
  ) AS filter_username
FROM track AS t
  LEFT JOIN twitter_user AS u1 ON u1.id = t.user_id
  AND t.type LIKE 'twitter_%'
  LEFT JOIN twitcasting_user AS u2 ON u2.id = t.user_id
  AND t.type LIKE 'twitcasting_%'
  LEFT JOIN twitch_user AS u3 ON u3.id = t.user_id
  AND t.type LIKE 'twitch_%'
  LEFT JOIN instagram_user AS u4 ON u4.id = t.user_id
  AND t.type LIKE 'instagram_%'
  LEFT JOIN tiktok_user AS u5 ON u5.id = t.user_id
  AND t.type LIKE 'tiktok_%'
  LEFT JOIN twitter_user AS fu1 ON fu1.id = t.filter_user_id
  AND t.type LIKE 'twitter_%'
  LEFT JOIN twitcasting_user AS fu2 ON fu2.id = t.filter_user_id
  AND t.type LIKE 'twitcasting_%'
  LEFT JOIN twitch_user AS fu3 ON fu3.id = t.filter_user_id
  AND t.type LIKE 'twitch_%'
  LEFT JOIN instagram_user AS fu4 ON fu4.id = t.filter_user_id
  AND t.type LIKE 'instagram_%'
  LEFT JOIN tiktok_user AS fu5 ON fu5.id = t.filter_user_id
  AND t.type LIKE 'tiktok_%'
WHERE t.is_active = TRUE
  AND t.discord_channel_id = $1
ORDER BY t.updated_at
    `

    const data: any[] = await this.repository.query(query, [discordChannelId])
    const items = data.map((v) => ({
      isActive: v.is_active,
      type: v.type,
      userId: v.user_id,
      username: v.username,
      filterUserId: v.filter_user_id,
      filterUsername: v.filter_username,
    }))
    return items
  }
}
