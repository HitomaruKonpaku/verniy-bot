import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { TweetV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterTweetService } from '../data/twitter-tweet.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterTweetControllerService {
  private readonly logger = baseLogger.child({ context: TwitterTweetControllerService.name })

  private dbLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  constructor(
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) { }

  public async saveTweet(result: any) {
    const id = result.rest_id

    const tweet = await this.dbLimiter.key(id).schedule(async () => {
      let curTweet = await this.twitterTweetService.getOneById(result.rest_id)
      if (!curTweet) {
        curTweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
        curTweet.isNew = true
      }

      try {
        const subResult = result.core.user_results.result
        curTweet.author = await this.twitterUserControllerService.patchUser(subResult)
      } catch (error) {
        this.logger.error(`saveTweet#user: ${error.message}`, { id, result })
      }

      if (result.legacy.retweeted_status_result?.result) {
        const subResult = result.legacy.retweeted_status_result.result
        try {
          curTweet.retweetedStatus = await this.saveTweet(subResult)
        } catch (error) {
          this.logger.error(`saveTweet#retweeted_status: ${error.message}`, { id, subResult })
        }
      }

      if (result.quoted_status_result?.result) {
        const subResult = result.quoted_status_result.result
        try {
          curTweet.quotedStatus = await this.saveTweet(subResult)
        } catch (error) {
          this.logger.error(`saveTweet#quoted_status: ${error.message}`, { id, subResult })
        }
      }

      return curTweet
    })

    return tweet
  }

  public async saveTweetV2(data: TweetV2) {
    const tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweetV2(data))
    return tweet
  }
}
