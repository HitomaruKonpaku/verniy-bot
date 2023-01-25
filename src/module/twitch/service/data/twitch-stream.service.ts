import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { TwitchStream } from '../../model/twitch-stream.entity'

@Injectable()
export class TwitchStreamService extends BaseEntityService<TwitchStream> {
  constructor(
    @InjectRepository(TwitchStream)
    public readonly repository: Repository<TwitchStream>,
  ) {
    super()
  }

  public async getOneById(
    id: string,
    options?: {
      withUser?: boolean
    },
  ) {
    const query = this.repository
      .createQueryBuilder('ts')
      .andWhere('ts.id = :id', { id })
    if (options?.withUser) {
      query.leftJoinAndMapOne(
        'ts.user',
        'twitch_user',
        'tu',
        'tu.id = ts.user_id',
      )
    }
    const stream = await query.getOne()
    return stream
  }
}
