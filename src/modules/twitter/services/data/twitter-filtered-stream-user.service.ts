import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TwitterFilteredStreamUser } from '../../models/twitter-filtered-stream-user.entity'

@Injectable()
export class TwitterFilteredStreamUserService extends BaseEntityService<TwitterFilteredStreamUser> {
  constructor(
    @InjectRepository(TwitterFilteredStreamUser)
    public readonly repository: Repository<TwitterFilteredStreamUser>,
  ) {
    super()
  }

  public async getIdsForInitUsers(): Promise<string[]> {
    const records = await this.repository
      .createQueryBuilder('tfsu')
      .select('tfsu.id')
      .leftJoin('twitter_user', 'tu', 'tu.id = tfsu.id')
      .andWhere('tfsu.is_active = TRUE')
      .andWhere('tu.id ISNULL')
      .getRawMany()
    const ids = records.map((v) => v.tfsu_id)
    return ids
  }

  public async getUsersForInitRules() {
    const records = await this.repository
      .createQueryBuilder('tfsu')
      .leftJoinAndMapOne('tfsu.user', 'twitter_user', 'tu', 'tu.id = tfsu.id')
      .andWhere('tfsu.is_active = TRUE')
      .andWhere('tu.is_retired = FALSE')
      .addOrderBy('LENGTH(tu.username)', 'DESC')
      .addOrderBy('CAST(tu.id AS INTERGER)')
      .getMany()
    const users = records.map((v) => v.user)
    return users
  }

  public async saveId(id: string) {
    await this.repository.save({ id, isActive: true })
  }

  public async add(id: string) {
    await this.repository.upsert(
      {
        id,
        isActive: true,
      },
      { conflictPaths: ['id'] },
    )
  }

  public async remove(id: string) {
    await this.repository.update({ id }, { isActive: false })
  }
}
