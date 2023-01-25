/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeApiService } from './youtube-api.service'

@Injectable()
export class YoutubePlaylistItemApiService extends YoutubeApiService {
  protected logger = baseLogger.child({ context: YoutubePlaylistItemApiService.name })

  /**
   * @see https://developers.google.com/youtube/v3/docs/playlistItems/list
   */
  public async list(
    ids: string[],
    options?: youtube_v3.Params$Resource$Playlistitems$List,
  ) {
    const { data } = await this.youtube.playlistItems.list({
      id: ids,
      part: ['id', 'snippet', 'contentDetails', 'status'],
      maxResults: this.maxResults,
      ...options,
    })
    return data
  }
}
