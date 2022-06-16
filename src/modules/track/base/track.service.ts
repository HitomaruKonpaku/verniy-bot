/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from 'typeorm'
import { Track } from './track.entity'

export abstract class TrackService<T extends Track> {
  public readonly repository: Repository<T>

  public async getManyByUserId(userId: string, options?: Record<string, any>) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    const records = await query.getMany()
    return records
  }

  public async getManyByUserIds(userIds: string[], options?: Record<string, any>) {
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
    discordMessage: string = null,
    updatedBy: string = null,
    options: Record<string, any> = {},
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        updatedBy,
        userId,
        discordChannelId,
        discordMessage,
        ...(options || {}),
      } as any,
      {
        conflictPaths: ['type', 'userId', 'discordChannelId'],
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
