import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { QueryOptions } from '../../../database/interface/query-options.interface'
import { TwitCastingUser } from '../../model/twitcasting-user.entity'

@Injectable()
export class TwitCastingUserService extends BaseEntityService<TwitCastingUser> {
  constructor(
    @InjectRepository(TwitCastingUser)
    public readonly repository: Repository<TwitCastingUser>,
  ) {
    super()
  }

  public async getOneByScreenId(id: string) {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('LOWER(screen_id) = LOWER(:id)', { id })
      .getOne()
    return result
  }

  public async getOneByIdOrScreenId(id: string) {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('(id = :id) OR (LOWER(screen_id) = LOWER(:id))', { id })
      .getOne()
    return result
  }

  public async getManyActive(options?: QueryOptions) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .addOrderBy('updated_at', 'ASC', 'NULLS FIRST')

    if (Number.isSafeInteger(options?.limit)) {
      query.limit(options.limit)
    }

    const result = await query.getMany()
    return result
  }
}
