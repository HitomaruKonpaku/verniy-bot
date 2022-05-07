import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TwitterDiscordTweet } from '../models/twitter-discord-tweet'

export class TwitterDiscordTweetService {
  private readonly logger = baseLogger.child({ context: TwitterDiscordTweetService.name })

  constructor(
    @InjectRepository(TwitterDiscordTweet)
    private readonly repository: Repository<TwitterDiscordTweet>,
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
FROM twitter_discord_tweet AS td
  JOIN twitter_user AS tu ON tu.id = td.twitter_user_id
WHERE td.is_active = TRUE
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
  ) {
    if (!twitterUserId || !discordChannelId) {
      return
    }
    try {
      await this.repository.upsert(
        {
          isActive: true,
          updatedAt: new Date(),
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
    } catch (error) {
      this.logger.error(`add: ${error.message}`, { twitterUserId, discordChannelId })
    }
  }

  public async remove(twitterUserId: string, discordChannelId: string) {
    if (!twitterUserId || !discordChannelId) {
      return
    }
    try {
      await this.repository.update(
        {
          twitterUserId,
          discordChannelId,
        },
        {
          isActive: false,
          updatedAt: new Date(),
        },
      )
    } catch (error) {
      this.logger.error(`remove: ${error.message}`, { twitterUserId, discordChannelId })
    }
  }
}
