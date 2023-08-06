/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeBaseApiService } from './base/youtube-base-api.service'

@Injectable()
export class YoutubeVideoApiService extends YoutubeBaseApiService {
  protected logger = baseLogger.child({ context: YoutubeVideoApiService.name })

  private readonly part = ['id', 'snippet', 'contentDetails', 'status', 'statistics', 'liveStreamingDetails']

  /**
 * @see https://developers.google.com/youtube/v3/docs/videos/list
 */
  public async list(
    ids: string[],
    options?: youtube_v3.Params$Resource$Videos$List,
  ) {
    const { data } = await this.youtube.videos.list({
      id: ids,
      part: this.part,
      maxResults: this.maxResults,
      ...options,
    })
    return data
  }
}
