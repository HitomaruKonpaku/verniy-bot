import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { baseLogger } from '../../../../logger'

@Injectable()
export class HolodexApiService {
  private readonly logger = baseLogger.child({ context: HolodexApiService.name })

  private readonly BASE_URL = 'https://staging.holodex.net/api/v2'

  private client: AxiosInstance

  constructor() {
    if (!this.apiKey) {
      this.logger.error('HOLODEX_API_KEY not found')
    }
    this.initClient()
  }

  // eslint-disable-next-line class-methods-use-this
  private get apiKey() {
    return process.env.HOLODEX_API_KEY
  }

  public async notice(url: string) {
    const response = await this.client.post('external/notice', { url })
    return response
  }

  public initClient() {
    this.client = axios.create({
      baseURL: this.BASE_URL,
      headers: { 'x-apikey': this.apiKey },
    })
  }
}
