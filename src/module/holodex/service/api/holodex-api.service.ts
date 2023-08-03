import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { baseLogger } from '../../../../logger'

@Injectable()
export class HolodexApiService {
  private readonly logger = baseLogger.child({ context: HolodexApiService.name })

  private readonly BASE_URL = 'https://staging.holodex.net/api/v2'

  private client: AxiosInstance

  constructor() {
    this.initClient()
  }

  public async notice(url: string) {
    const res = await this.client.post('external/notice', { url })
    return res
  }

  public async getChannels(params?: Record<string, any>) {
    const url = 'channels'
    const res = await this.client.get<any[]>(url, { params })
    return res
  }

  public async getChannelById(id: string) {
    const url = `channels/${id}`
    const res = await this.client.get(url)
    return res
  }

  public async getVideoById(id: string) {
    const url = `videos/${id}`
    const res = await this.client.get(url)
    return res
  }

  public initClient() {
    const key = process.env.HOLODEX_API_KEY
    if (!key) {
      this.logger.error('HOLODEX_API_KEY not found')
    }

    this.client = axios.create({
      baseURL: this.BASE_URL,
      headers: { 'x-apikey': key },
    })
  }
}
