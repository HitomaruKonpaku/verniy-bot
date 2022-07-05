/* eslint-disable camelcase */
import { Injectable } from '@nestjs/common'
import { google, youtube_v3 } from 'googleapis'
import { baseLogger } from '../../../../logger'

@Injectable()
export class YoutubeApiService {
  private readonly logger = baseLogger.child({ context: YoutubeApiService.name })

  private youtube: youtube_v3.Youtube

  constructor() {
    if (!this.apiKey) {
      this.logger.error('YOUTUBE_API_KEY not found')
    }
    this.initClient()
  }

  // eslint-disable-next-line class-methods-use-this
  private get apiKey() {
    return process.env.YOUTUBE_API_KEY
  }

  /**
   * @see https://developers.google.com/youtube/v3/docs/channels/list
   */
  public async getChannelsByIds(ids: string[]) {
    const { data } = await this.youtube.channels.list({
      id: ids,
      part: ['id', 'snippet'],
      maxResults: 50,
    })
    return data
  }

  /**
   * @see https://developers.google.com/youtube/v3/docs/videos/list
   */
  public async getVideosByIds(ids: string[]) {
    const { data } = await this.youtube.videos.list({
      id: ids,
      part: ['id', 'snippet'],
      maxResults: 50,
    })
    return data
  }

  public initClient() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey,
    })
  }
}
