import Bottleneck from 'bottleneck'
import { TwitterGuestTokenBase } from '../base/twitter-guest-token-base'
import { TwitterApi } from '../twitter.api'
import { TWITTER_PUBLIC_AUTHORIZATION_2 } from '../twitter.constant'

export class TwitterGuestToken2 extends TwitterGuestTokenBase {
  constructor(
    protected readonly limiter: Bottleneck,
    protected readonly api: TwitterApi,
  ) {
    super(limiter)
  }

  public async fetchToken(): Promise<string> {
    const { data } = await this.api.guest.activate(TWITTER_PUBLIC_AUTHORIZATION_2)
    const token = data.guest_token
    return token
  }
}
