import winston from 'winston'
import { logger as baseLogger } from '../../../logger'
import { db } from '../Database'
import { TwitterDiscordTweet } from '../models/TwitterDiscordTweet'

class TwitterDiscordTweetController {
  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[TwitterDiscordTweetController]' })
  }

  // eslint-disable-next-line class-methods-use-this
  private get repository() {
    return db.connection.getRepository(TwitterDiscordTweet)
  }

  public async getTwitterUsernames() {
    const records = await this.repository
      .createQueryBuilder()
      .select('twitter_username')
      .distinct()
      .andWhere('is_active = TRUE')
      .addOrderBy('twitter_username')
      .getRawMany()
    const usernames = records.map((v) => v.twitter_username) as string[]
    return usernames
  }

  public async getManyByTwitterUsername(
    username: string,
    config?: { allowReply?: boolean, allowRetweet?: boolean },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('LOWER(twitter_username) = LOWER(:username)', { username })
    if (config?.allowReply) {
      query.andWhere('allow_reply = TRUE')
    }
    if (config?.allowRetweet) {
      query.andWhere('allow_retweet = TRUE')
    }
    const records = await query.getMany()
    return records
  }

  public async existTwitterUsername(username: string) {
    const count = await this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('LOWER(twitter_username) = LOWER(:username)', { username })
      .getCount()
    const isExist = count > 0
    return isExist
  }

  public async add(
    twitterUsername: string,
    discordChannelId: string,
    allowReply = true,
    allowRetweet = true,
    filterKeywords?: string[],
  ) {
    if (!twitterUsername || !discordChannelId) {
      return
    }
    try {
      await this.repository.upsert(
        {
          isActive: true,
          updatedAt: new Date(),
          twitterUsername: twitterUsername.toLowerCase(),
          discordChannelId,
          allowReply,
          allowRetweet,
          filterKeywords,
        },
        {
          conflictPaths: ['twitterUsername', 'discordChannelId'],
          skipUpdateIfNoValuesChanged: true,
        },
      )
    } catch (error) {
      this.logger.error(`add: ${error.message}`, { twitterUsername, discordChannelId })
    }
  }

  public async remove(twitterUsername: string, discordChannelId: string) {
    if (!twitterUsername || !discordChannelId) {
      return
    }
    try {
      await this.repository.upsert(
        {
          isActive: false,
          updatedAt: new Date(),
          twitterUsername: twitterUsername.toLowerCase(),
          discordChannelId,
        },
        {
          conflictPaths: ['twitterUsername', 'discordChannelId'],
          skipUpdateIfNoValuesChanged: true,
        },
      )
    } catch (error) {
      this.logger.error(`remove: ${error.message}`, { twitterUsername, discordChannelId })
    }
  }
}

export const twitterDiscordTweetController = new TwitterDiscordTweetController()
