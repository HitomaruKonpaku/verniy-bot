/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from 'typeorm'
import { BaseTrackEntity } from '../../models/base/base-track.entity'

export abstract class BaseTrackService<T extends BaseTrackEntity> {
  public readonly repository: Repository<T>

  public async getDiscordChannelIds() {
    const records = await this.repository
      .createQueryBuilder()
      .select('discord_channel_id')
      .distinct()
      .getRawMany()
    const ids = records.map((v) => v.discord_channel_id) as string[]
    return ids
  }

  public async getManyByUserId(userId: string, options?: any) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async getManyByUserIds(userIds: string[], options?: any) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id IN (:...userIds)', { userIds })
    const records = await query.getMany()
    return records
  }

  public async add(
    userId: string,
    discordChannelId: string,
    discordMessage = null,
    updatedBy?: string,
    options?: any,
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        userId,
        discordChannelId,
        discordMessage,
      } as any,
      {
        conflictPaths: ['userId', 'discordChannelId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    userId: string,
    discordChannelId: string,
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        userId,
        discordChannelId,
      } as any,
      {
        isActive: false,
        updatedAt: Date.now(),
        updatedBy,
      } as any,
    )
  }
}
