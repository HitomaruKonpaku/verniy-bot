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
      if (result.items?.length) {
        channel = await this.saveChannel(result.items[0])
      }
    }

    return channel
  }

  public async getManyByIds(ids: string[], refresh = false) {
    let channels = refresh
      ? null
      : await this.youtubeChannelService.getManyByIds(ids)

    if (!channels?.length) {
      const result = await this.youtubeChannelApiService.list(ids)
      if (result.items?.length) {
        channels = await this.saveChannels(result.items)
      }
    }

    return channels || []
  }

  public async saveChannel(item: youtube_v3.Schema$Channel) {
    const channel = await this.youtubeChannelService.save(YoutubeEntityUtil.buildChannel(item))
    return channel
  }

  public async saveChannels(items: youtube_v3.Schema$Channel[]) {
    const channels = await this.youtubeChannelService.saveAll(items.map((item) => YoutubeEntityUtil.buildChannel(item)))
    return channels
  }
}
