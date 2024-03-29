import { Inject, Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { randomUUID } from 'crypto'
import { baseLogger } from '../../../../logger'
import { tiktokUserLimiter } from '../../tiktok.limiter'
import { TiktokProxyService } from './tiktok-proxy.service'

@Injectable()
export class TiktokApiService {
  private readonly logger = baseLogger.child({ context: TiktokApiService.name })

  private client: AxiosInstance

  constructor(
    @Inject(TiktokProxyService)
    private readonly tiktokProxyService: TiktokProxyService,
  ) {
    this.initClient()
  }

  public async getUserFeed(username: string) {
    const requestId = randomUUID()
    const meta = { requestId, username }
    try {
      const url = `@${username}/rss`
      const { data } = await tiktokUserLimiter.schedule(() => this.client.get(url))
      return data
    } catch (error) {
      this.logger.error(`getUserFeed: ${error.message}`, meta)
      throw error
    }
  }

  public initClient() {
    this.client = axios.create({
      baseURL: this.tiktokProxyService.getProxyUrl(),
    })
  }
}
