import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterTweet } from '../models/track-twitter-tweet.entity'

export class TrackTwitterTweetService {
  constructor(
    @InjectRepository(TrackTwitterTweet)
    public readonly repository: Repository<TrackTwitterTweet>,
  ) { }

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

  public async getDiscordChannelIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('discord_channel_id')
      .distinct()
      .getRawMany()
    const ids = records.map((v) => v.discord_channel_id) as string[]
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
    twitterUserId: string,
    config?: { allowReply?: boolean, allowRetweet?: boolean },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id = :twitterUserId', { twitterUserId })
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
