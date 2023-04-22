import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitterEntityUtil } from '../../util/twitter-entity.util'
import { TwitterTweetService } from '../data/twitter-tweet.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterTweetControllerService {
  private readonly logger = baseLogger.child({ context: TwitterTweetControllerService.name })

  constructor(
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
  ) { }

  public async getUser(result: any) {
    const id = result.rest_id
    let user = await this.twitterUserService.getOneById(id)
    if (!user) {
      user = await this.saveUser(result)
    }
    return user
  }

  public async saveUser(result: any) {
    const user = await this.twitterUserService.save(TwitterEntityUtil.buildUser(result))
    return user
  }

  public async saveTweet(result: any) {
    const user = await this.getUser(result.core.user_results.result)
    const tweet = await this.twitterTweetService.save(TwitterEntityUtil.buildTweet(result))
    tweet.user = user

    if (result.legacy.retweeted_status_result?.result) {
      try {
        tweet.retweetedStatus = await this.saveTweet(result.legacy.retweeted_status_result.result)
      } catch (error) {
        console.error(error)
        debugger
      }
    }

    if (result.quoted_status_result?.result) {
      try {
        tweet.quotedStatus = await this.saveTweet(result.quoted_status_result.result)
      } catch (error) {
        console.error(error)
        debugger
      }
    }

    return tweet
  }
}
