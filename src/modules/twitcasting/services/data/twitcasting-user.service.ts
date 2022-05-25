import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TwitCastingUser } from '../../models/twitcasting-user.entity'

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

  public async getManyActive() {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .getMany()
    return result
  }
}
