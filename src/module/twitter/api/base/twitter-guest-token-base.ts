import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { TWITTER_GUEST_TOKEN_DURATION } from '../twitter.constant'

export abstract class TwitterGuestTokenBase {
  protected logger = baseLogger.child({ context: TwitterGuestTokenBase.name })

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
        await this.getNewToken()
      }
      return this.token
    })
    return token
  }

  private async getNewToken() {
    try {
      this.token = await this.fetchToken()
      this.createdAt = Date.now()
    } catch (error) {
      this.logger.error(`getNewToken: ${error.message}`)
    }
  }
}
