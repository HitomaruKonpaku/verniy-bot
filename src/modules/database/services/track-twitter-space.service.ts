import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { logger as baseLogger } from '../../../logger'
import { TrackTwitterSpace } from '../models/track-twitter-space'

export class TrackTwitterSpaceService {
  private readonly logger = baseLogger.child({ context: TrackTwitterSpaceService.name })

  constructor(
    @InjectRepository(TrackTwitterSpace)
    private readonly repository: Repository<TrackTwitterSpace>,
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

  public async getManyByTwitterUserId(twitterUserId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('twitter_user_id = :twitterUserId', { twitterUserId })
    const records = await query.getMany()
    return records
  }

  public async add(
    twitterUserId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: new Date(),
        updatedBy,
        twitterUserId,
        discordChannelId,
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
        updatedAt: new Date(),
        updatedBy,
      },
    )
  }
}
