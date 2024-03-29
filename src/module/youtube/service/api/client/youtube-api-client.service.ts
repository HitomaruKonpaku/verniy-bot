/* eslint-disable camelcase */
import { youtube, youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'

@Injectable()
export class YoutubeApiClientService {
  protected logger = baseLogger.child({ context: YoutubeApiClientService.name })

  public youtube: youtube_v3.Youtube

  constructor() {
    this.initClient()
  }

  protected initClient() {
    const key = process.env.YOUTUBE_API_KEY
    if (!key) {
      this.logger.error('YOUTUBE_API_KEY not found')
    }
    this.youtube = youtube({ version: 'v3', auth: key })
  }
}
