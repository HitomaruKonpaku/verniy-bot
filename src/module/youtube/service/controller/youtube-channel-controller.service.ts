/* eslint-disable camelcase */
import { youtube_v3 } from '@googleapis/youtube'
import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeEntityUtil } from '../../util/youtube-entity.util'
import { YoutubeChannelApiService } from '../api/youtube-channel-api.service'
import { YoutubeChannelService } from '../data/youtube-channel.service'

@Injectable()
export class YoutubeChannelControllerService {
  private readonly logger = baseLogger.child({ context: YoutubeChannelControllerService.name })

  constructor(
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
    @Inject(YoutubeChannelApiService)
    private readonly youtubeChannelApiService: YoutubeChannelApiService,
  ) { }

  public async getOneById(id: string, refresh = false) {
    let channel = refresh
      ? null
      : await this.youtubeChannelService.getOneById(id)
    if (!channel) {
      const result = await this.youtubeChannelApiService.list([id])
      const item = result.items?.[0]
      if (item) {
        channel = await this.saveChannel(item)
      }
    }
    return channel
  }

  public async saveChannel(data: youtube_v3.Schema$Channel) {
    const channel = await this.youtubeChannelService.save(YoutubeEntityUtil.buildChannel(data))
    return channel
  }
}
