import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TwitchUser } from '../../models/twitch-user.entity'

@Injectable()
export class TwitchUserService extends BaseEntityService<TwitchUser> {
  constructor(
    @InjectRepository(TwitchUser)
    public readonly repository: Repository<TwitchUser>,
  ) {
    super()
  }

  public async getOneByUsername(username: string) {
    const user = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = LOWER(:username)', { username })
      .addOrderBy('is_active', 'DESC')
      .getOne()
    return user
  }
}
