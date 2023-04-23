import { baseLogger } from '../../../../logger'
import { TwitterGraphqlApi } from '../../api/twitter-graphql.api'
import { twitterGqlUserByRestIdLimiter, twitterGqlUserByScreenNameLimiter, twitterGqlUserTweetsLimiter } from '../../twitter.limiter'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlUserService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlUserService.name })

  public async getUserByRestId(userId: string) {
    const limiter = twitterGqlUserByRestIdLimiter
    const { data } = await limiter.schedule(async () => TwitterGraphqlApi.getUserByRestId(
      userId,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }

  public async getUserByScreenName(screenName: string) {
    const limiter = twitterGqlUserByScreenNameLimiter
    const { data } = await limiter.schedule(async () => TwitterGraphqlApi.getUserByScreenName(
      screenName,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }

  public async getUserTweets(userId: string) {
    const limiter = twitterGqlUserTweetsLimiter
    const { data } = await limiter.schedule(async () => TwitterGraphqlApi.getUserTweets(
      userId,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }

  public async getUserTweetsAndReplies(userId: string) {
    const limiter = twitterGqlUserTweetsLimiter
    const { data } = await limiter.schedule(async () => TwitterGraphqlApi.getUserTweetsAndReplies(
      userId,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }
}
