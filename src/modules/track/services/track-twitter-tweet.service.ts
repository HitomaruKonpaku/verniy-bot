import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TrackTwitterTweet } from '../models/track-twitter-tweet.entity'
import { TrackBaseService } from './base/track-base.service'

@Injectable()
export class TrackTwitterTweetService extends TrackBaseService<TrackTwitterTweet> {
  constructor(
    @InjectRepository(TrackTwitterTweet)
    public readonly repository: Repository<TrackTwitterTweet>,
  ) {
    super()
  }

  public async getManyByUserId(
    userId: string,
    options: {
      allowReply: boolean
      allowRetweet: boolean
    },
  ) {
    const query = this.repository
      .createQueryBuilder()
      .andWhere('is_active = TRUE')
      .andWhere('user_id = :userId', { userId })
    if (options?.allowReply) {
      query.andWhere('allow_reply = TRUE')
    }
    if (options?.allowRetweet) {
      query.andWhere('allow_retweet = TRUE')
    }
    const records = await query.getMany()
    return records
  }

  public async add(
    userId: string,
    discordChannelId: string,
    discordMessage: string = null,
    options: {
      updatedBy?: string,
      allowReply?: boolean,
      allowRetweet?: boolean,
    } = {},
  ) {
    // eslint-disable-next-line no-param-reassign
    options = Object.assign(options || {}, {
      allowReply: options?.allowReply ?? true,
      allowRetweet: options?.allowRetweet ?? true,
    })
    await super.add(
      userId,
      discordChannelId,
      discordMessage,
      options,
    )
  }
}
