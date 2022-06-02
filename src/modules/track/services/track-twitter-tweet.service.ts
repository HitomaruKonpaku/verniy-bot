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
      .select('twitter_user_id')
      .distinct()
      .andWhere('is_active = TRUE')
      .addOrderBy('LENGTH(twitter_user_id)')
      .addOrderBy('twitter_user_id')
      .getRawMany()
    const ids = records.map((v) => v.twitter_user_id) as string[]
    return ids
  }

  public async getTwitterUsernames() {
    const query = `
SELECT DISTINCT (tu.username)
FROM track_twitter_tweet AS tt
  JOIN twitter_user AS tu ON tu.id = tt.twitter_user_id
WHERE tt.is_active = TRUE
ORDER BY LOWER(tu.username)
    `
    const records = await this.repository.query(query)
    const usernames = records.map((v) => v.username) as string[]
    return usernames
  }

  public async getManyByTwitterUserId(
    userId: string,
    config?: { allowReply?: boolean, allowRetweet?: boolean },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id = :userId', { userId })
    if (config?.allowReply) {
      query.andWhere('allow_reply = TRUE')
    }
    if (config?.allowRetweet) {
      query.andWhere('allow_retweet = TRUE')
    }
    const records = await query.getMany()
    return records
  }

  public async getManyByTwitterUserIds(
    userIds: string[],
    config?: { allowReply?: boolean, allowRetweet?: boolean },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id IN (:...userIds)', { userIds })
    if (config?.allowReply) {
      query.andWhere('allow_reply = TRUE')
    }
    if (config?.allowRetweet) {
      query.andWhere('allow_retweet = TRUE')
    }
    const records = await query.getMany()
    return records
  }

  public async existTwitterUserId(twitterUserId: string) {
    const count = await this.repository.count({
      where: {
        isActive: true,
        twitterUserId,
      },
    })
    const isExist = count > 0
    return isExist
  }

  public async add(
    twitterUserId: string,
    discordChannelId: string,
    discordMessage = null,
    allowReply = true,
    allowRetweet = true,
    filterKeywords?: string[],
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
        allowReply,
        allowRetweet,
        filterKeywords,
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
