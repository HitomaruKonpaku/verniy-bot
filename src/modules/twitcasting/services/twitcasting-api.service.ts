import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { logger as baseLogger } from '../../../logger'

@Injectable()
export class TwitCastingApiService {
  private readonly logger = baseLogger.child({ context: TwitCastingApiService.name })

  private client: AxiosInstance

  constructor() {
    const clientId = process.env.TWITCASTING_CLIENT_ID
    const clientSecret = process.env.TWITCASTING_CLIENT_SECRET
    if (!clientId) {
      this.logger.error('TWITCASTING_CLIENT_ID not found')
    }
    if (!clientSecret) {
      this.logger.error('TWITCASTING_CLIENT_SECRET not found')
    }
    this.client = axios.create({
      baseURL: 'https://apiv2.twitcasting.tv',
      headers: {
        authorization: (clientId && clientSecret ? `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}` : ''),
      },
    })
  }

  /**
   *  @see https://apiv2-doc.twitcasting.tv/#get-user-info
   */
  public async getUserById(id: string) {
    const { data } = await this.client.get(`users/${id}`)
    return data
  }

  /**
   *  @see https://apiv2-doc.twitcasting.tv/#get-movie-info
   */
  public async getMovieById(id: string) {
    const { data } = await this.client.get(`movies/${id}`)
    return data
  }
}
