import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { InstagramUser } from '../../models/instagram-user.entity'

@Injectable()
export class InstagramUserService extends BaseEntityService<InstagramUser> {
  constructor(
    @InjectRepository(InstagramUser)
    public readonly repository: Repository<InstagramUser>,
  ) {
    super()
  }

  public async getOneByUsername(username: string) {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(username) = LOWER(:username)', { username })
      .getOne()
    return result
  }

  public async getManyForTracking() {
    const result = await this.repository
      .createQueryBuilder('u')
      .innerJoin(
        'track_instagram_post',
        'tip',
        'tip.user_id = u.id AND tip.is_active = TRUE',
      )
      .andWhere('u.is_active = TRUE')
      .getMany()
    return result
  }
}
