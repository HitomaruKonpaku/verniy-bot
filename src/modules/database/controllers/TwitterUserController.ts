import winston from 'winston'
import { logger as baseLogger } from '../../../logger'
import { db } from '../Database'
import { TwitterUser } from '../models/TwitterUser'

class TwitterUserController {
  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[TwitterUserController]' })
  }

  // eslint-disable-next-line class-methods-use-this
  private get repository() {
    return db.connection.getRepository(TwitterUser)
  }

  public async getOneById(id: string) {
    const user = await this.repository.findOne({ where: { id } })
    return user
  }

  public async getAll() {
    const users = await this.repository.find()
    return users
  }

  public async getManyForTweet() {
    const users = await this.repository
      .createQueryBuilder('tu')
      .innerJoin(
        'twitter_discord_tweet',
        'tdt',
        'LOWER(tdt.twitter_username) = LOWER(tu.username) AND tdt.is_active = TRUE',
      )
      .addOrderBy('tu.username')
      .getMany()
    return users
  }

  public async update(data: TwitterUser): Promise<TwitterUser> {
    if (!data) return null
    try {
      const user = await this.repository.save(data)
      return user
    } catch (error) {
      this.logger.error(`update: ${error.message}`, data)
    }
    return null
  }
}

export const twitterUserController = new TwitterUserController()
