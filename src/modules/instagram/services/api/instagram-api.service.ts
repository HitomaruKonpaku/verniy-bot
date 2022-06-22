import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { user } from 'instagram-api.js'
import { getStories } from 'instagram-stories'
import { baseLogger } from '../../../../logger'
import { instagramUserLimiter, instagramUserStoriesLimiter } from '../../instagram.limiter'

@Injectable()
export class InstagramApiService {
  private readonly logger = baseLogger.child({ context: InstagramApiService.name })

  constructor() {
    if (!this.sessionId) {
      this.logger.error('INSTAGRAM_SESSION_ID not found')
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
        const response = await user(username)
        this.logger.debug('<-- getUser', { requestId, username })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getUser: ${error.message}`, { username })
      throw error
    }
  }

  public async getUserStories(userId: string) {
    const requestId = randomUUID()
    try {
      const data = await instagramUserStoriesLimiter.schedule(async () => {
        this.logger.debug('--> getUserStories', { requestId, userId })
        const response = await getStories({ id: userId, sessionid: this.sessionId })
        const { status } = response
        const storyCount = response.items?.length
        this.logger.debug('<-- getUserStories', {
          requestId, userId, status, storyCount,
        })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getUserStories: ${error.message}`, { userId })
      throw error
    }
  }
}
