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
      const { data } = await tiktokUserLimiter.schedule(() => {
        this.logger.debug('--> getUserFeed', meta)
        return this.client.get(url)
      })
      this.logger.debug('<-- getUserFeed', meta)
      return data
    } catch (error) {
      this.logger.error(`getUserFeed: ${error.message}`, meta)
      if (error.response?.status === 500) {
        this.tiktokProxyService.switchProxy()
      }
      throw error
    }
  }

  public initClient() {
    this.client = axios.create({
      baseURL: this.tiktokProxyService.getProxyUrl(),
    })
  }
}
