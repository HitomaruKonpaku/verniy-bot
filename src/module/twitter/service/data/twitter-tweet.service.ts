import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
import { QueryOptions } from '../../../database/interface/query-options.interface'
import { TwitterTweet } from '../../model/twitter-tweet.entity'

@Injectable()
export class TwitterTweetService extends BaseEntityService<TwitterTweet> {
  constructor(
    @InjectRepository(TwitterTweet)
    public readonly repository: Repository<TwitterTweet>,
  ) {
    super()
  }

  public async getOneById(
    id: string,
    options?: {
      withAuthor?: boolean
    },
  ) {
    const query = this.repository
      .createQueryBuilder('t')
      .andWhere('t.id = :id', { id })
    if (options?.withAuthor) {
      query.leftJoinAndMapOne(
        't.author',
        'twitter_user',
        'u',
        'u.id = t.author_id',
      )
    }
    const tweet = await query.getOne()
    return tweet
  }

  public async getManyForCheck(options?: QueryOptions) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .addOrderBy('updated_at', 'ASC', 'NULLS FIRST')
      .addOrderBy('created_at')

    if (Number.isSafeInteger(options?.limit)) {
      query.limit(options.limit)
    }

    const tweets = await query.getMany()
    return tweets
  }
}
