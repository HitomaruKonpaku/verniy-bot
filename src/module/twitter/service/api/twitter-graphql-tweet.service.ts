import { baseLogger } from '../../../../logger'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlTweetService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlTweetService.name })

  public async getDetail(id: string) {
    const { data } = await this.api.graphql.TweetDetail(id)
    return data?.data
  }

  public async getResultByRestId(id: string) {
    const { data } = await this.api.graphql.TweetResultByRestId(id)
    return data?.data
  }
}
