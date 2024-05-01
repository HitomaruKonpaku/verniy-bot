import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { TweetV2 } from 'twitter-api-v2'
import { baseLogger } from '../../../../logger'
import { Result } from '../../interface/twitter-tweet.interface'
import { TwitterTweet } from '../../model/twitter-tweet.entity'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterTweetUtil } from '../../util/twitter-tweet.util'
import { TwitterGraphqlTweetService } from '../api/twitter-graphql-tweet.service'
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
    @Inject(TwitterGraphqlTweetService)
    private readonly twitterGraphqlTweetService: TwitterGraphqlTweetService,
  ) { }

  public async getByTweetDetail(id: string) {
    const data = await this.twitterGraphqlTweetService.getDetail(id)
    const results = TwitterTweetUtil.parseTweetDetail(data)
    const result = results.find((v) => v && v.rest_id === id)
    if (!result) {
      await this.twitterTweetService.updateFields(id, { isActive: false, updatedAt: Date.now() })
      return null
    }
    if (!result.rest_id) {
      await this.twitterTweetService.updateFields(id, { updatedAt: Date.now() })
      return null
    }
    const tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
    return tweet
  }

  public async getByTweetResultByRestId(id: string) {
    const data = await this.twitterGraphqlTweetService.getResultByRestId(id)
    const { result } = data.tweetResult
    if (!result) {
      await this.twitterTweetService.updateFields(id, { isActive: false, updatedAt: Date.now() })
      return null
    }
    if (!result.rest_id) {
      await this.twitterTweetService.updateFields(id, { updatedAt: Date.now() })
      return null
    }
    const tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
    return tweet
  }

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
    const oldTweet = await this.twitterTweetService.getOneById(result.rest_id)
    const newTweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
    if (!oldTweet) {
      newTweet.isNew = true
    }

    newTweet.author = await this.saveTweetAuthor(result)
    newTweet.inReplyToUser = await this.getTweetInReplyToUser(newTweet)
    newTweet.retweetedStatus = await this.saveRetweetedStatusResult(result)
    newTweet.quotedStatus = await this.saveQuotedStatusResult(result)

    return newTweet
  }

  private async saveTweetAuthor(result: Result) {
    const tmpResult = result.tweet || result
    const id = tmpResult.rest_id
    const subResult = tmpResult.core?.user_result?.result

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
        user = await this.twitterUserControllerService.getOneByRestId(tweet.inReplyToUserId)
      }
      return user
    } catch (error) {
      this.logger.error(`getTweetInReplyToUser: ${error.message}`, { id: tweet.id })
    }

    return null
  }
}
