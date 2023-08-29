import Bottleneck from 'bottleneck'
import { TWITTER_GUEST_TOKEN_DURATION } from '../twitter.constant'

export abstract class TwitterGuestTokenBase {
  private token: string
  private createdAt: number

  constructor(
    protected readonly limiter: Bottleneck,
  ) { }

  public abstract fetchToken(): Promise<string>

  public async getToken(refresh = true): Promise<string> {
    const token = await this.limiter.schedule(async () => {
      const tokenAge = Date.now() - (this.createdAt || 0)
      const canRefresh = refresh
        || !this.token
        || tokenAge >= TWITTER_GUEST_TOKEN_DURATION
      if (canRefresh) {
        this.token = await this.fetchToken()
        this.createdAt = Date.now()
      }
      return this.token
    })
    return token
  }
}
