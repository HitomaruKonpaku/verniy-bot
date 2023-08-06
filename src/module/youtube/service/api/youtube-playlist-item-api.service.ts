/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeBaseApiService } from './base/youtube-base-api.service'

@Injectable()
export class YoutubePlaylistItemApiService extends YoutubeBaseApiService {
  protected logger = baseLogger.child({ context: YoutubePlaylistItemApiService.name })

  private readonly part = ['id', 'snippet', 'contentDetails', 'status']

  /**
   * @see https://developers.google.com/youtube/v3/docs/playlistItems/list
   */
  public async list(
    ids: string[],
    options?: youtube_v3.Params$Resource$Playlistitems$List,
  ) {
    const { data } = await this.youtube.playlistItems.list({
      id: ids,
      part: this.part,
      maxResults: this.maxResults,
      ...options,
    })
    return data
  }
}
