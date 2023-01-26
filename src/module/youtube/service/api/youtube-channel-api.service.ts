/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeApiService } from './youtube-api.service'

@Injectable()
export class YoutubeChannelApiService extends YoutubeApiService {
  protected logger = baseLogger.child({ context: YoutubeChannelApiService.name })

  private readonly part = ['id', 'snippet', 'contentDetails', 'status', 'statistics']

  /**
   * @see https://developers.google.com/youtube/v3/docs/channels/list
   */
  public async list(
    ids: string[],
    options?: youtube_v3.Params$Resource$Channels$List,
  ) {
    const { data } = await this.youtube.channels.list({
      id: ids,
      part: this.part,
      maxResults: this.maxResults,
      ...options,
    })
    return data
  }
}
