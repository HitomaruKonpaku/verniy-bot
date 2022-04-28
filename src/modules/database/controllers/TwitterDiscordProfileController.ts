import winston from 'winston'
import { logger as baseLogger } from '../../../logger'
import { db } from '../Database'
import { TwitterDiscordProfile } from '../models/TwitterDiscordProfile'
import { StringUtils } from '../utils/StringUtils'

class TwitterDiscordProfileController {
  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[TwitterDiscordProfileController]' })
  }

  // eslint-disable-next-line class-methods-use-this
  private get repository() {
    return db.connection.getRepository(TwitterDiscordProfile)
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

  public async getManyByTwitterUsername(username: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_username LIKE :username ESCAPE :escapeChar', {
        username: StringUtils.getEscapeValue(username),
        escapeChar: '!',
      })
    const records = await query.getMany()
    return records
  }

  public async add(
    twitterUsername: string,
    discordChannelId: string,
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

export const twitterDiscordProfileController = new TwitterDiscordProfileController()
