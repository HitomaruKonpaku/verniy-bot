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
        'track',
        't',
        't.user_id = tu.id AND t.is_active = TRUE AND t.type = :type',
        { type: TrackType.TWITTER_PROFILE },
      )
      .andWhere('t.user_id ISNULL')
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
