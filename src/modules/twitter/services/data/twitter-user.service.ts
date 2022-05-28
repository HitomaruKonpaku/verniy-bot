import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TwitterUser } from '../../models/twitter-user.entity'

@Injectable()
export class TwitterUserService extends BaseEntityService<TwitterUser> {
  constructor(
    @InjectRepository(TwitterUser)
    public readonly repository: Repository<TwitterUser>,
  ) {
    super()
  }

  public async getRawOneById(id: string) {
    const user = await this.repository
      .createQueryBuilder('tu')
      .select('tu.*')
      .andWhere('tu.id = :id', { id })
      .getRawOne()
    return user
  }

  public async getOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = LOWER(:username)', { username })
      .addOrderBy('is_active', 'DESC')
      .getOne()
    return user
  }

  public async getRawOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder('tu')
      .select('tu.*')
      .andWhere('LOWER(tu.username) = LOWER(:username)', { username })
      .addOrderBy('tu.is_active', 'DESC')
      .getRawOne()
    return user
  }

  public async getManyForCheck() {
    const users = await this.repository
      .createQueryBuilder('tu')
      .leftJoin(
        'track_twitter_profile',
        'ttp',
        'ttp.is_active = TRUE AND ttp.twitter_user_id = tu.id',
      )
      .andWhere('ttp.twitter_user_id ISNULL')
      .getMany()
    return users
  }

  public async updateIsActive(id: string, isActive: boolean) {
    const user = await this.repository.findOneByOrFail({ id })
    await this.repository.update({ id }, { isActive })
    Object.assign(user, { isActive })
    return user
  }
}
