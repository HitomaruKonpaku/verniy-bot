import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { user } from 'instagram-api.js'
import { baseLogger } from '../../../../logger'
import { instagramUserLimiter } from '../../instagram.limiter'

@Injectable()
export class InstagramApiService {
  private readonly logger = baseLogger.child({ context: InstagramApiService.name })

  constructor() {
    if (!this.sessionId) {
      this.logger.warn('INSTAGRAM_SESSION_ID not found')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private get sessionId() {
    return process.env.INSTAGRAM_SESSION_ID
  }

  public async getUser(username: string) {
    const requestId = randomUUID()
    try {
      const data = await instagramUserLimiter.schedule(async () => {
        this.logger.debug('--> getUser', { requestId, username })
        const response = user(username, this.sessionId)
        this.logger.debug('<-- getUser', { requestId, username })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getUser: ${error.message}`, { username })
      throw error
    }
  }
}
