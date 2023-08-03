import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { baseLogger } from '../../../../logger'
import { HOLODEX_API_URL } from '../../constant/holodex.constant'

@Injectable()
export class HolodexApiService {
  private readonly logger = baseLogger.child({ context: HolodexApiService.name })

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
    const baseUrl = HOLODEX_API_URL
    const key = process.env.HOLODEX_API_KEY
    if (!key) {
      this.logger.error('HOLODEX_API_KEY not found')
    }

    const client = axios.create({
      baseURL: baseUrl,
      headers: { 'x-apikey': key },
    })
    this.client = client

    client.interceptors.request.use(
      async (config) => {
        this.logRequest(config)
        return config
      },
      null,
    )

    client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        return response
      },
      (error) => {
        this.logResponse(error.response)
        return Promise.reject(error)
      },
    )
  }

  private logRequest(config: AxiosRequestConfig) {
    const { url } = config
    this.logger.debug(['-->', url].join(' '))
  }

  private logResponse(res: AxiosResponse) {
    if (!res?.config) {
      return
    }
    const { url } = res.config
    this.logger.debug(['<--', url].join(' '))
  }
}
