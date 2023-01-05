import { Inject, Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { randomUUID } from 'crypto'
import { getStories } from 'instagram-stories'
import { USER_AGENT } from '../../../../constants/app.constant'
import { baseLogger } from '../../../../logger'
import { EnvironmentEvent } from '../../../environment/enums/environment-event.enum'
import { EnvironmentService } from '../../../environment/services/environment.service'
import { instagramUserLimiter, instagramUserStoriesLimiter } from '../../instagram.limiter'

@Injectable()
export class InstagramApiService {
  private readonly logger = baseLogger.child({ context: InstagramApiService.name })

  private client: AxiosInstance

  constructor(
    @Inject(EnvironmentService)
    private readonly environmentService: EnvironmentService,
  ) {
    this.addListeners()
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

  // eslint-disable-next-line class-methods-use-this
  private get csrfToken() {
    return process.env.INSTAGRAM_CSRF_TOKEN
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

  public async getUserStories(userId: string, username?: string) {
    const requestId = randomUUID()
    try {
      const result = await instagramUserStoriesLimiter.schedule(async () => {
        this.logger.debug('--> getUserStories', { requestId, username, userId })
        const data = await getStories({ id: userId, sessionid: this.sessionId })
        const status = data?.status
        const storyCount = data?.items?.length
        this.logger.debug('<-- getUserStories', {
          requestId,
          username,
          userId,
          status,
          storyCount,
        })
        return data
      })
      return result
    } catch (error) {
      this.logger.error(`getUserStories: ${error.message}`, { username, userId })
      throw error
    }
  }

  private initClient() {
    if (!this.sessionId) {
      this.logger.error('INSTAGRAM_SESSION_ID not found')
    }
    if (!this.dsUserId) {
      this.logger.error('INSTAGRAM_DS_USER_ID not found')
    }
    this.logger.debug('initClient', {
      sessionId: this.sessionId
        ?.split?.('')
        ?.reverse?.()
        ?.filter?.((_, i) => i < 42)
        ?.reverse?.()
        ?.join?.(''),
      dsUserId: this.dsUserId,
      csrfToken: this.csrfToken,
    })

    const cookie = [
      this.dsUserId ? `ds_user_id=${this.dsUserId}` : null,
      this.sessionId ? `sessionid=${this.sessionId}` : null,
      this.csrfToken ? `csrftoken=${this.csrfToken}` : null,
    ].filter((v) => v).join('; ')

    this.client = axios.create({
      headers: {
        'user-agent': USER_AGENT,
        cookie,
        authority: 'www.instagram.com',
        referer: 'https://www.instagram.com/',
        'x-asbd-id': '198387',
        'x-csrftoken': this.csrfToken,
        'x-ig-app-id': '936619743392459',
        'x-ig-www-claim': 'hmac.AR1lts5LQlM3J5rl2e7av5kDLO5qY6dGkuqruQMXFHBTbZ5y',
        'x-requested-with': 'XMLHttpRequest',
      },
    })
  }

  private addListeners() {
    this.environmentService.on(EnvironmentEvent.RELOAD, () => {
      this.initClient()
    })
  }
}
