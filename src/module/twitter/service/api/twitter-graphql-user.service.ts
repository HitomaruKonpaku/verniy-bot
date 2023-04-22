import { baseLogger } from '../../../../logger'
import { TwitterGraphqlApi } from '../../api/twitter-graphql.api'
import { twitterUserTweetsLimiter } from '../../twitter.limiter'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlUserService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlUserService.name })

  public async getUserTweets(userId: string) {
    const { data } = await twitterUserTweetsLimiter.schedule(async () => TwitterGraphqlApi.getUserTweets(
      userId,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }

  public async getUserTweetsAndReplies(userId: string) {
    const { data } = await twitterUserTweetsLimiter.schedule(async () => TwitterGraphqlApi.getUserTweetsAndReplies(
      userId,
      await this.getGuestTokenHeaders(),
    ))
    return data?.data
  }
}
