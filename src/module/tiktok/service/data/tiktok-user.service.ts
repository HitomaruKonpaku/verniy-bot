import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TiktokUser } from '../../model/tiktok-user.entity'

@Injectable()
export class TiktokUserService extends BaseEntityService<TiktokUser> {
  constructor(
    @InjectRepository(TiktokUser)
    public readonly repository: Repository<TiktokUser>,
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
}
