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
}
