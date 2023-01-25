/* eslint-disable @typescript-eslint/no-unused-vars */
import { Repository } from 'typeorm'
import { Track } from '../../model/base/track.entity'

export abstract class TrackBaseService<T extends Track> {
  public readonly repository: Repository<T>

  public async existUserId(userId: string) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    const count = await query.getCount()
    const isExist = count > 0
    return isExist
  }

  public async getManyByUserId(userId: string, options?: Record<string, any>) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
      .andWhere('filter_user_id = :filterUserId', { filterUserId: options?.filterUserId || '' })
    const records = await query.getMany()
    return records
  }

  public async getManyByUserIds(userIds: string[], options?: Record<string, any>) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id IN (:...userIds)', { userIds })
      .andWhere('filter_user_id = :filterUserId', { filterUserId: options?.filterUserId || '' })
    const records = await query.getMany()
    return records
  }

  public async add(
    userId: string,
    discordChannelId: string,
    discordMessage: string = null,
    options: Record<string, any> = {},
  ) {
    await this.repository.upsert(
      {
        isActive: true,
        updatedAt: Date.now(),
        userId,
        discordChannelId,
        discordMessage,
        ...(options || {}),
      } as any,
      {
        conflictPaths: ['type', 'userId', 'discordChannelId', 'filterUserId'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
  }

  public async remove(
    userId: string,
    discordChannelId: string,
    criteria: Record<string, any> = {},
    updatedBy?: string,
  ) {
    await this.repository.update(
      {
        userId,
        discordChannelId,
        ...(criteria || {}),
      } as any,
      {
        isActive: false,
        updatedAt: Date.now(),
        updatedBy,
      } as any,
    )
  }
}
