import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TrackType } from '../../../track/enum/track-type.enum'
import { InstagramUser } from '../../model/instagram-user.entity'

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
        'track',
        't',
        't.user_id = u.id AND t.is_active = TRUE AND t.type IN (:...types)',
        { types: [TrackType.INSTAGRAM_POST, TrackType.INSTAGRAM_STORY, TrackType.INSTAGRAM_PROFILE] },
      )
      .andWhere('u.is_active = TRUE')
      .addOrderBy('t.created_at', 'ASC')
      .getMany()
    return result
  }
}
