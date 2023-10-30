import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { QueryOptions } from '../../../database/interface/query-options.interface'
import { TwitterBroadcast } from '../../model/twitter-broadcast.entity'
import { TwitterUserService } from './twitter-user.service'

@Injectable()
export class TwitterBroadcastService extends BaseEntityService<TwitterBroadcast> {
  constructor(
    @InjectRepository(TwitterBroadcast)
    public readonly repository: Repository<TwitterBroadcast>,
    @Inject(TwitterUserService)
    public readonly twitterUserService: TwitterUserService,
  ) {
    super()
  }

  public async getManyLiveIds(): Promise<string[]> {
    const query = `
SELECT id
FROM twitter_broadcast
WHERE is_active = TRUE
  AND (
    state = 'live'
  )
    `
    const broadcasts = await this.repository.query(query)
    const ids = broadcasts.map((v) => v.id)
    return ids
  }

  public async getManyActive(options?: QueryOptions) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .addOrderBy('modified_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at')

    if (Number.isSafeInteger(options?.limit)) {
      query.limit(options.limit)
    }

    const broadcasts = await query.getMany()
    return broadcasts
  }

  public async getRawOneById(id: string) {
    const broadcast = await this.repository
      .createQueryBuilder('b')
      .select('b.*')
      .andWhere('b.id = :id', { id })
      .getRawOne()
    return broadcast
  }
}
