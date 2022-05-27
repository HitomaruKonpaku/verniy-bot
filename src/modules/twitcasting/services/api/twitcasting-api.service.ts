import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { randomUUID } from 'crypto'
import { logger as baseLogger } from '../../../../logger'
import { twitCastingUserByIdLimiter } from '../../twitcasting.limiter'

@Injectable()
export class TwitCastingApiService {
  private readonly logger = baseLogger.child({ context: TwitCastingApiService.name })

  private client: AxiosInstance

  constructor() {
    if (!this.clientId) {
      this.logger.error('TWITCASTING_CLIENT_ID not found')
    }
    if (!this.clientSecret) {
      this.logger.error('TWITCASTING_CLIENT_SECRET not found')
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

  /**
   *  @see https://apiv2-doc.twitcasting.tv/#get-user-info
   */
  public async getUserById(id: string) {
    const requestId = randomUUID()
    try {
      const { data } = await twitCastingUserByIdLimiter.schedule(async () => {
        this.logger.debug('--> getUserById', { requestId, id })
        const response = await this.client.get(`users/${id}`)
        this.logger.debug('<-- getUserById', { requestId, id })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getUserById: ${error.message}`, { requestId, id })
      throw error
    }
  }

  /**
   *  @see https://apiv2-doc.twitcasting.tv/#get-movie-info
   */
  public async getMovieById(id: string) {
    const requestId = randomUUID()
    try {
      const { data } = await twitCastingUserByIdLimiter.schedule(async () => {
        this.logger.debug('--> getMovieById', { requestId, id })
        const response = await this.client.get(`movies/${id}`)
        this.logger.debug('<-- getMovieById', { requestId, id })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getMovieById: ${error.message}`, { requestId, id })
      throw error
    }
  }

  /**
   *  @see https://apiv2-doc.twitcasting.tv/#get-movies-by-user
   */
  public async getMoviesByUserId(
    id: string,
    opts?: { limit?: number, offset?: number },
  ) {
    const requestId = randomUUID()
    const limit = opts?.limit || 20
    const offset = opts?.offset || 0
    try {
      const params = new URLSearchParams()
      params.append('limit', String(limit))
      params.append('offset', String(offset))
      const { data } = await twitCastingUserByIdLimiter.schedule(async () => {
        this.logger.debug('--> getMoviesByUserId', {
          requestId, id, limit, offset,
        })
        const response = await this.client.get(`users/${id}/movies?${params.toString()}`)
        this.logger.debug('<-- getMoviesByUserId', { requestId, id })
        return response
      })
      return data
    } catch (error) {
      this.logger.error(`getMoviesByUserId: ${error.message}`, {
        requestId, id, limit, offset,
      })
      throw error
    }
  }

  private initClient() {
    this.client = axios.create({
      baseURL: 'https://apiv2.twitcasting.tv',
      headers: { authorization: (this.clientId && this.clientSecret ? `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}` : '') },
    })
  }
}
