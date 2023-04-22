import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '../../../../shared/service/base-entity.service'
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
}
