/* eslint-disable class-methods-use-this */
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitterGuestApi } from '../../api/twitter-guest.api'
import { TWITTER_PUBLIC_AUTHORIZATION } from '../../constant/twitter.constant'
import { TwitterTokenService } from '../twitter-token.service'

@Injectable()
export class TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterPublicApiService.name })

  constructor(
    @Inject(forwardRef(() => TwitterTokenService))
    protected readonly twitterTokenService: TwitterTokenService,
  ) { }

  protected getCookieHeaders() {
    const token = this.twitterTokenService.getAuthToken()
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      cookie: [`auth_token=${token}`].join(';'),
    }
    return headers
  }

  protected async getGuestTokenHeaders() {
    const guestToken = await this.twitterTokenService.getGuestToken()
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      'x-guest-token': guestToken,
    }
    return headers
  }

  public async getGuestToken(): Promise<string> {
    const { data } = await TwitterGuestApi.postActivate({ authorization: TWITTER_PUBLIC_AUTHORIZATION })
    return data.guest_token
  }
}
