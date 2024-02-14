import { baseLogger } from '../../../../logger'
import { TwitterApiOptions } from '../../api/interface/twitter-api.interface'
import { twitterGqlUserByRestIdLimiter, twitterGqlUserByScreenNameLimiter, twitterGqlUserTweetsLimiter } from '../../twitter.limiter'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlUserService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlUserService.name })

  public async getUserByRestId(userId: string) {
    const limiter = twitterGqlUserByRestIdLimiter
    const { data } = await limiter.schedule(() => this.api.graphql.UserByRestId(userId))
    return data?.data
  }

  public async getUserByScreenName(screenName: string, opts?: TwitterApiOptions) {
    const limiter = twitterGqlUserByScreenNameLimiter
    const { data } = await limiter.schedule(() => this.api.graphql.UserByScreenName(screenName, opts))
    return data?.data
  }

  public async getUserTweets(userId: string) {
    const limiter = twitterGqlUserTweetsLimiter
    const { data } = await limiter.schedule(() => this.api.graphql.UserTweets(userId))
    return data?.data
  }

  public async getUserTweetsAndReplies(userId: string) {
    const limiter = twitterGqlUserTweetsLimiter
    const { data } = await limiter.schedule(() => this.api.graphql.UserTweetsAndReplies(userId))
    return data?.data
  }
}
