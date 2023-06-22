import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { TweetV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { Result } from '../../interface/twitter-tweet.interface'
import { TwitterTweet } from '../../model/twitter-tweet.entity'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterTweetService } from '../data/twitter-tweet.service'
import { TwitterUserService } from '../data/twitter-user.service'
import { TwitterUserControllerService } from './twitter-user-controller.service'

@Injectable()
export class TwitterTweetControllerService {
  private readonly logger = baseLogger.child({ context: TwitterTweetControllerService.name })

  private dbLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  constructor(
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) { }

  public async saveTweet(result: Result) {
    const id = result.rest_id
    const tweet = await this.dbLimiter.key(id).schedule(() => this.saveTweetResult(result))
    return tweet
  }

  public async saveTweetV2(data: TweetV2) {
    const tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweetV2(data))
    return tweet
  }

  private async saveTweetResult(result: Result) {
    let tweet = await this.twitterTweetService.getOneById(result.rest_id)
    if (!tweet) {
      tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
      tweet.isNew = true
    }

    tweet.author = await this.saveTweetAuthor(result)
    tweet.inReplyToUser = await this.getTweetInReplyToUser(tweet)
    tweet.retweetedStatus = await this.saveRetweetedStatusResult(result)
    tweet.quotedStatus = await this.saveQuotedStatusResult(result)

    return tweet
  }

  private async saveTweetAuthor(result: Result) {
    const id = result.rest_id
    const subResult = result.core.user_results.result

    try {
      const user = await this.twitterUserControllerService.patchUser(subResult)
      return user
    } catch (error) {
      this.logger.error(`saveTweetAuthor: ${error.message}`, { id, subResult })
    }

    return null
  }

  private async saveRetweetedStatusResult(result: Result) {
    const id = result.rest_id
    const subResult = result.legacy?.retweeted_status_result?.result
    if (!subResult) {
      return null
    }

    try {
      const tweet = await this.saveTweet(subResult)
      return tweet
    } catch (error) {
      this.logger.error(`saveRetweetedStatusResult: ${error.message}`, { id, subResult })
    }

    return null
  }

  private async saveQuotedStatusResult(result: Result) {
    const id = result.rest_id
    const subResult = result.quoted_status_result?.result
    if (!subResult) {
      return null
    }

    // eslint-disable-next-line no-underscore-dangle
    if (subResult.__typename === 'TweetTombstone') {
      return null
    }

    try {
      const tweet = await this.saveTweet(subResult)
      return tweet
    } catch (error) {
      this.logger.error(`saveQuotedStatusResult: ${error.message}`, { id, subResult })
    }

    return null
  }

  private async getTweetInReplyToUser(tweet: TwitterTweet) {
    if (!tweet.inReplyToUserId) {
      return null
    }

    if (tweet.inReplyToUserId === tweet.authorId) {
      return tweet.author
    }

    try {
      let user = await this.twitterUserService.getOneById(tweet.inReplyToUserId)
      if (!user) {
        user = await this.twitterUserControllerService.getUserByRestId(tweet.inReplyToUserId)
      }
      return user
    } catch (error) {
      this.logger.error(`getTweetInReplyToUser: ${error.message}`, { id: tweet.id })
    }

    return null
  }
}
