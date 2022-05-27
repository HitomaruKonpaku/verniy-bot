import { forwardRef, Inject, Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { randomUUID } from 'crypto'
import { logger as baseLogger } from '../../../../logger'
import { TwitchTokenService } from '../twitch-token.service'

@Injectable()
export class TwitchApiService {
  private readonly logger = baseLogger.child({ context: TwitchApiService.name })

  private readonly BASE_URL = 'https://api.twitch.tv'
  private readonly AUTH_URL = 'https://id.twitch.tv/oauth2/token'

  private client: AxiosInstance

  constructor(
    @Inject(forwardRef(() => TwitchTokenService))
    private readonly twitchTokenService: TwitchTokenService,
  ) {
    if (!this.clientId) {
      this.logger.error('TWITCH_CLIENT_ID not found')
    }
    if (!this.clientSecret) {
      this.logger.error('TWITCH_CLIENT_SECRET not found')
    }
    this.initClient()
  }

  // eslint-disable-next-line class-methods-use-this
  private get clientId() {
    return process.env.TWITCH_CLIENT_ID
  }

  // eslint-disable-next-line class-methods-use-this
  private get clientSecret() {
    return process.env.TWITCH_CLIENT_SECRET
  }

  public async getAccessToken() {
    const { data } = await axios.post(this.AUTH_URL, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
    })
    return data
  }

  public async getUsersByUsernames(usernames: string[]) {
    const requestId = randomUUID()
    this.logger.debug('--> getUsersByUsernames', { requestId, userCount: usernames.length })
    const params = usernames.map((v) => `login=${v}`).join('&')
    const { data } = await this.client.get(`helix/users?${params}`)
    this.logger.debug('<-- getUsersByUsernames', { requestId })
    return data
  }

  private initClient() {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      headers: { 'client-id': this.clientId },
    })
    this.client.interceptors.request.use((async (request) => {
      const accessToken = await this.twitchTokenService.getAccessToken()
      request.headers.authorization = `Bearer ${accessToken}`
      return Promise.resolve(request)
    }))
  }
}
