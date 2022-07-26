import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { randomUUID } from 'crypto'
import { getStories } from 'instagram-stories'
import { USER_AGENT } from '../../../../constants/app.constant'
import { baseLogger } from '../../../../logger'
import { instagramUserLimiter, instagramUserStoriesLimiter } from '../../instagram.limiter'

@Injectable()
export class InstagramApiService {
  private readonly logger = baseLogger.child({ context: InstagramApiService.name })

  private client: AxiosInstance

  constructor() {
    if (!this.sessionId) {
      this.logger.error('INSTAGRAM_SESSION_ID not found')
    }
    if (!this.dsUserId) {
      this.logger.error('INSTAGRAM_DS_USER_ID not found')
    }
    this.initClient()
  }

  // eslint-disable-next-line class-methods-use-this
  private get sessionId() {
    return process.env.INSTAGRAM_SESSION_ID
  }

  // eslint-disable-next-line class-methods-use-this
  private get dsUserId() {
    return process.env.INSTAGRAM_DS_USER_ID
  }

  public async getUser(username: string) {
    const requestId = randomUUID()
    try {
      const result = await instagramUserLimiter.schedule(async () => {
        this.logger.debug('--> getUser', { requestId, username })
        const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`
        const { data } = await this.client.get(url)
        const user = data?.data?.user
        const postCount = user?.edge_owner_to_timeline_media?.edges?.length || -1
        this.logger.debug('<-- getUser', {
          requestId,
          username,
          postCount,
        })
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
        const status = data?.status
        const storyCount = data?.items?.length
        this.logger.debug('<-- getUserStories', {
          requestId,
          userId,
          status,
          storyCount,
        })
        return data
      })
      return result
    } catch (error) {
      this.logger.error(`getUserStories: ${error.message}`, { userId })
      throw error
    }
  }

  private initClient() {
    this.client = axios.create({
      headers: {
        'user-agent': USER_AGENT,
        cookie: [
          `sessionid=${this.sessionId}`,
          `ds_user_id=${this.dsUserId}`,
        ].join('; '),
        'x-ig-app-id': '936619743392459',
      },
    })
  }
}
