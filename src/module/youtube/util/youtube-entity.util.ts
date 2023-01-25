/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { YoutubeChannel } from '../model/youtube-channel.entity'
import { YoutubeApiUtil } from './youtube-api.util'

export class YoutubeEntityUtil {
  public static buildChannel(data: youtube_v3.Schema$Channel) {
    const obj: YoutubeChannel = {
      id: data.id,
      isActive: true,
      createdAt: new Date(data.snippet.publishedAt || 0).getTime(),
      updatedAt: Date.now(),
      name: data.snippet.title,
      description: data.snippet.description,
      thumbnailUrl: YoutubeApiUtil.getThumbnailUrl(data.snippet.thumbnails),
      customUrl: data.snippet.customUrl,
      country: data.snippet.country,
      videoCount: Number(data.statistics.videoCount),
      subscriberCount: Number(data.statistics.subscriberCount),
      viewCount: Number(data.statistics.viewCount),
    }
    return obj
  }
}
