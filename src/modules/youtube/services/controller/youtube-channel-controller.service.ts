/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeApiUtils } from '../../utils/youtube-api.utils'
import { YoutubeApiService } from '../api/youtube-api.service'
import { YoutubeChannelService } from '../data/youtube-channel.service'

@Injectable()
export class YoutubeChannelControllerService {
  private readonly logger = baseLogger.child({ context: YoutubeChannelControllerService.name })

  constructor(
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
    @Inject(YoutubeApiService)
    private readonly youtubeApiService: YoutubeApiService,
  ) { }

  public async getOneById(id: string) {
    let channel = await this.youtubeChannelService.getOneById(id)
    if (!channel) {
      const result = await this.youtubeApiService.getChannelsByIds([id])
      const item = result?.items?.[0]
      if (item) {
        channel = await this.saveChannel(item)
      }
    }
    return channel
  }

  public async saveChannel(data: youtube_v3.Schema$Channel) {
    const channel = await this.youtubeChannelService.save({
      id: data.id,
      isActive: true,
      createdAt: data.snippet?.publishedAt
        ? new Date(data.snippet.publishedAt).getTime()
        : 0,
      name: data.snippet?.title || null,
      description: data.snippet?.description || null,
      country: data.snippet?.country || null,
      thumbnailUrl: YoutubeApiUtils.getThumbnailUrl(data.snippet?.thumbnails) || null,
    })
    return channel
  }
}
