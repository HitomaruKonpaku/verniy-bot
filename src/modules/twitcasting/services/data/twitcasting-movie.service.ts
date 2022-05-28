import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/services/base-entity.service'
import { TwitCastingMovie } from '../../models/twitcasting-movie.entity'

@Injectable()
export class TwitCastingMovieService extends BaseEntityService<TwitCastingMovie> {
  constructor(
    @InjectRepository(TwitCastingMovie)
    public readonly repository: Repository<TwitCastingMovie>,
  ) {
    super()
  }

  public async getManyLive() {
    const result = await this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('is_live = TRUE')
      .getMany()
    return result
  }

  public async updateIsActive(id: string, isActive: boolean) {
    await this.repository.update({ id }, { isActive, isLive: false })
  }
}
