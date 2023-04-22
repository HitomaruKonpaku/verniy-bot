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
}
