import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TwitterDiscordProfile } from '../models/twitter-discord-profile'

export class TwitterDiscordProfileService {
  private readonly logger = baseLogger.child({ context: TwitterDiscordProfileService.name })

  constructor(
    @InjectRepository(TwitterDiscordProfile)
    private readonly repository: Repository<TwitterDiscordProfile>,
  ) { }

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
      .andWhere('LOWER(twitter_username) = LOWER(:username)', { username })
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
