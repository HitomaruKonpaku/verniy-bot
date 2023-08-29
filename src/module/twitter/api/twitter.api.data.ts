import Bottleneck from 'bottleneck'
import { TwitterGuestTokenBase } from './base/twitter-guest-token-base'
import { TwitterRateLimit } from './interface/twitter-api.interface'
import { TwitterGuestToken1 } from './token/twitter-guest-token-1'
import { TwitterGuestToken2 } from './token/twitter-guest-token-2'
import { TwitterGuestTokenDocumentCookie } from './token/twitter-guest-token-document-cookie'
import { TwitterApi } from './twitter.api'

export class TwitterApiData {
  public readonly rateLimits: Record<string, TwitterRateLimit> = {}

  private guestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })

  private guestTokens: TwitterGuestTokenBase[] = []

  constructor(
    protected readonly api: TwitterApi,
  ) {
    this.guestTokens.push(new TwitterGuestToken1(this.guestTokenLimiter, this.api))
    this.guestTokens.push(new TwitterGuestToken2(this.guestTokenLimiter, this.api))
    this.guestTokens.push(new TwitterGuestTokenDocumentCookie(this.guestTokenLimiter))
  }

  public async getGuestToken(refresh = false): Promise<string> {
    const token = await this.guestTokens[0].getToken(refresh)
    return token
  }

  public async getGuestToken2(refresh = false): Promise<string> {
    const token = await this.guestTokens[1].getToken(refresh)
    return token
  }

  public async getGuestTokenDocumentCookie(refresh = false): Promise<string> {
    const token = await this.guestTokens[2].getToken(refresh)
    return token
  }
}
