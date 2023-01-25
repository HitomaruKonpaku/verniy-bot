/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeApiService } from './youtube-api.service'

@Injectable()
export class YoutubePlaylistApiService extends YoutubeApiService {
  protected logger = baseLogger.child({ context: YoutubePlaylistApiService.name })

  /**
   * @see https://developers.google.com/youtube/v3/docs/playlists/list
   */
  public async list(
    ids: string[],
    options?: youtube_v3.Params$Resource$Playlists$List,
  ) {
    const { data } = await this.youtube.playlists.list({
      id: ids,
      part: ['id', 'snippet', 'contentDetails', 'status'],
      maxResults: this.maxResults,
      ...options,
    })
    return data
  }
}
