import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { TWITTER_GUEST_TOKEN_DURATION } from '../constant/twitter.constant'
import { twitterGuestTokenLimiter } from '../twitter.limiter'
import { TwitterPublicApiService } from './api/twitter-public-api.service'

@Injectable()
export class TwitterTokenService {
  private readonly logger = baseLogger.child({ context: TwitterTokenService.name })

  private guestToken: string
  private guestTokenCreatedAt: number
  private guestTokenReservoir = 0
  private guestTokenReservoirRefreshAmount = 500

  constructor(
    @Inject(forwardRef(() => TwitterPublicApiService))
    private readonly twitterPublicApiService: TwitterPublicApiService,
  ) {
    this.resetGuestTokenReservoir()
  }

  public async getGuestToken(forceRefresh = false) {
    const limiter = twitterGuestTokenLimiter
    const token = await limiter.schedule(async () => {
      const tokenAliveDuration = Date.now() - (this.guestTokenCreatedAt || 0)
      const canRefresh = forceRefresh
        || !this.guestToken
        || this.guestTokenReservoir <= 0
        || tokenAliveDuration >= TWITTER_GUEST_TOKEN_DURATION
      if (canRefresh) {
        this.logger.debug('--> getGuestToken')
        this.guestToken = await this.twitterPublicApiService.getGuestToken()
        this.guestTokenCreatedAt = Date.now()
        this.logger.debug('<-- getGuestToken', { guestToken: this.guestToken })
        this.resetGuestTokenReservoir()
      }
      this.guestTokenReservoir -= 1
      return Promise.resolve(this.guestToken)
    })
    return token
  }

  // eslint-disable-next-line class-methods-use-this
  public getAuthToken() {
    const token = process.env.TWITTER_AUTH_TOKEN
    return token
  }

  private resetGuestTokenReservoir() {
    this.guestTokenReservoir = this.guestTokenReservoirRefreshAmount
  }
}
