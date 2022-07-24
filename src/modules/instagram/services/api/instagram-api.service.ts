import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { randomUUID } from 'crypto'
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
      const result = await instagramUserLimiter.schedule(async () => {
        this.logger.debug('--> getUser', { requestId, username })
        const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
        const { data } = await axios.get(
          url,
          { headers: { 'x-ig-app-id': '936619743392459' } },
        )
        const user = data?.data?.user
        this.logger.debug('<-- getUser', { requestId, username, postCount: user?.edge_owner_to_timeline_media?.edges?.length })
        return user
      })
      return result
    } catch (error) {
      this.logger.error(`getUser: ${error.message}`, { username })
      throw error
    }
  }

  public async getUserStories(userId: string) {
    const requestId = randomUUID()
    try {
      const result = await instagramUserStoriesLimiter.schedule(async () => {
        this.logger.debug('--> getUserStories', { requestId, userId })
        const data = await getStories({ id: userId, sessionid: this.sessionId })
        const { status } = data
        const storyCount = data.items?.length
        this.logger.debug('<-- getUserStories', {
          requestId, userId, status, storyCount,
        })
        return data
      })
      return result
    } catch (error) {
      this.logger.error(`getUserStories: ${error.message}`, { userId })
      throw error
    }
  }
}
