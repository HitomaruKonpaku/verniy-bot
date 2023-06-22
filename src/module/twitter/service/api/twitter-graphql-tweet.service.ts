import { baseLogger } from '../../../../logger'
import { TwitterGraphqlApi } from '../../api/twitter-graphql.api'
import { TwitterPublicApiService } from './twitter-public-api.service'

export class TwitterGraphqlTweetService extends TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterGraphqlTweetService.name })

  public async getDetail(id: string) {
    const { data } = await TwitterGraphqlApi.getTweetDetail(
      id,
      await this.getGuestTokenHeaders(),
    )
    return data?.data
  }
}
