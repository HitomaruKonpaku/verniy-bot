import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterTweet } from '../models/track-twitter-tweet.entity'
import { BaseTrackService } from './base/base-track.service'

@Injectable()
export class TrackTwitterTweetService extends BaseTrackService<TrackTwitterTweet> {
  constructor(
    @InjectRepository(TrackTwitterTweet)
    public readonly repository: Repository<TrackTwitterTweet>,
  ) {
    super()
  }

  public async getTwitterUserIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('user_id')
      .distinct()
      .andWhere('is_active = TRUE')
      .addOrderBy('LENGTH(user_id)')
      .addOrderBy('user_id')
      .getRawMany()
    const ids = records.map((v) => v.user_id) as string[]
    return ids
  }

  public async getTwitterUsernames() {
    const query = `
SELECT DISTINCT (tu.username)
FROM track_twitter_tweet AS tt
  JOIN twitter_user AS tu ON tu.id = tt.user_id
WHERE tt.is_active = TRUE
ORDER BY LOWER(tu.username)
    `
    const records = await this.repository.query(query)
    const usernames = records.map((v) => v.username) as string[]
    return usernames
  }

  public async getManyByTwitterUserId(
    userId: string,
    options?: { allowReply?: boolean, allowRetweet?: boolean },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    if (options?.allowReply) {
      query.andWhere('allow_reply = TRUE')
    }
    if (options?.allowRetweet) {
      query.andWhere('allow_retweet = TRUE')
    }
    const records = await query.getMany()
    return records
  }

  public async existTwitterUserId(userId: string) {
    const count = await this.repository.count({
      where: {
        isActive: true,
        userId,
      },
    })
    const isExist = count > 0
    return isExist
  }

  public async add(
    userId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
    options?: {
      allowReply?: boolean
      allowRetweet?: boolean
      filterKeywords?: string[]
    },
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        userId,
        discordChannelId,
        discordMessage,
        allowReply: options?.allowReply || true,
        allowRetweet: options?.allowRetweet || true,
        filterKeywords: options?.filterKeywords || null,
      },
      {
        conflictPaths: ['userId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }
}
