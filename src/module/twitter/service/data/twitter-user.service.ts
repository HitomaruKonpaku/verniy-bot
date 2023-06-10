import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TrackType } from '../../../track/enum/track-type.enum'
import { TwitterUser } from '../../model/twitter-user.entity'

@Injectable()
export class TwitterUserService extends BaseEntityService<TwitterUser> {
  constructor(
    @InjectRepository(TwitterUser)
    public readonly repository: Repository<TwitterUser>,
  ) {
    super()
  }

  public async getOneByIdWithoutTrack(id: string) {
    const user = await this.repository
      .createQueryBuilder('u')
      .innerJoin(
        'track',
        't',
        't.user_id = u.id AND t.is_active = TRUE AND t.type IN (:...types)',
        { types: [TrackType.TWITTER_PROFILE] },
      )
      .andWhere('u.id = :id', { id })
      .getOne()
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

  public async getRawOneById(id: string) {
    const user = await this.repository
      .createQueryBuilder('u')
      .select('u.*')
      .andWhere('u.id = :id', { id })
      .getRawOne()
    return user
  }

  public async getRawOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder('u')
      .select('u.*')
      .andWhere('LOWER(u.username) = LOWER(:username)', { username })
      .addOrderBy('u.is_active', 'DESC')
      .getRawOne()
    return user
  }

  public async getManyForCheck() {
    const users = await this.repository
      .createQueryBuilder('u')
      .leftJoin(
        'track',
        't',
        't.user_id = u.id AND t.is_active = TRUE AND t.type = :type',
        { type: TrackType.TWITTER_PROFILE },
      )
      .andWhere('t.user_id ISNULL')
      .addOrderBy('u.updated_at', 'ASC')
      .limit(100)
      .getMany()
    return users
  }

  public async updateIsActive(id: string, isActive: boolean) {
    const user = await this.repository.findOneByOrFail({ id })
    const now = Date.now()
    const data: Partial<TwitterUser> = {
      isActive,
      updatedAt: now,
    }
    await this.repository.update({ id }, data)
    Object.assign(user, data)
    return user
  }
}
