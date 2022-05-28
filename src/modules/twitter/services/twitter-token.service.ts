import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { TWITTER_GUEST_TOKEN_DURATION } from '../constants/twitter.constant'
import { twitterGuestTokenLimiter } from '../twitter.limiter'
import { TwitterApiPublicService } from './api/twitter-api-public.service'

@Injectable()
export class TwitterTokenService {
  private readonly logger = baseLogger.child({ context: TwitterTokenService.name })

  private guestToken: string
  private guestTokenCreatedAt: number

  constructor(
    @Inject(forwardRef(() => TwitterApiPublicService))
    private readonly twitterApiPublicService: TwitterApiPublicService,
  ) { }

  public async getGuestToken(forceRefresh = false) {
    const token = await twitterGuestTokenLimiter.schedule(async () => {
      const tokenDeltaTime = Date.now() - (this.guestTokenCreatedAt || 0)
      if (forceRefresh || !(this.guestToken && tokenDeltaTime < TWITTER_GUEST_TOKEN_DURATION)) {
        this.logger.debug('--> getGuestToken')
        this.guestToken = await this.twitterApiPublicService.getGuestToken()
        this.guestTokenCreatedAt = Date.now()
        this.logger.debug('<-- getGuestToken', { guestToken: this.guestToken })
      }
      return Promise.resolve(this.guestToken)
    })
    return token
  }

  // eslint-disable-next-line class-methods-use-this
  public getAuthToken() {
    const token = process.env.TWITTER_AUTH_TOKEN
    return token
  }
}
