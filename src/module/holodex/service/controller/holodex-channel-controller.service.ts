import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { TwitterUserControllerService } from '../../../twitter/service/controller/twitter-user-controller.service'
import { YoutubeChannelControllerService } from '../../../youtube/service/controller/youtube-channel-controller.service'
import { YoutubeChannelService } from '../../../youtube/service/data/youtube-channel.service'
import { HolodexChannelAccountType } from '../../enum/holodex-channel-account-type.enum'
import { HolodexChannel } from '../../model/holodex-channel.entity'
import { HolodexEntityUtil } from '../../util/holodex-entity.util'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexChannelAccountService } from '../data/holodex-channel-account.service'
import { HolodexChannelService } from '../data/holodex-channel.service'

@Injectable()
export class HolodexChannelControllerService {
  private readonly logger = baseLogger.child({ context: HolodexChannelControllerService.name })

  constructor(
    @Inject(HolodexChannelService)
    private readonly holodexChannelService: HolodexChannelService,
    @Inject(HolodexChannelAccountService)
    private readonly holodexChannelAccountService: HolodexChannelAccountService,
    @Inject(HolodexApiService)
    private readonly holodexApiService: HolodexApiService,
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
    @Inject(YoutubeChannelControllerService)
    private readonly youtubeChannelControllerService: YoutubeChannelControllerService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
  ) { }

  public async getChannelById(id: string) {
    const { data } = await this.holodexApiService.getChannelById(id)
    const channel = await this.holodexChannelService.save(HolodexEntityUtil.buildChannel(data))
    return channel
  }

  public async getChannels(params?: Record<string, any>) {
    const limiter = new Bottleneck({ maxConcurrent: 5 })
    const { data } = await this.holodexApiService.getChannels(params)
    const channels = data.map((v) => HolodexEntityUtil.buildChannel(v))
    await this.holodexChannelService.saveAll(channels)
    await this.fetchYoutubeChannels(channels.map((v) => v.id))
    await Promise.allSettled(data.map((v) => limiter.schedule(() => this.fetchChannelAccounts(v))))
    return channels
  }

  public async getOrgChannels(org = '') {
    const channels: HolodexChannel[] = []
    const limit = 50
    let offset = 0
    let count = 0

    do {
      const params = { type: 'vtuber', org, limit, offset }
      // eslint-disable-next-line no-await-in-loop
      const data = await this.getChannels(params)
      channels.push(...data)
      count = data.length
      offset += limit
    } while (count === limit)

    return channels
  }

  public async fetchYoutubeChannels(ids: string[]) {
    try {
      const ytChannels = await this.youtubeChannelService.getManyByIds(ids)
      const newIds = ArrayUtil.difference(ids, ytChannels.map((v) => v.id))
      if (newIds.length) {
        this.logger.debug('fetchYoutubeChannels', { count: newIds.length, newChannelIds: newIds })
        await this.youtubeChannelControllerService.getManyByIds(newIds, true)
      }
    } catch (error) {
      this.logger.error(`fetchYoutubeChannels: ${error.message}`, { ids })
    }
  }

  public async fetchChannelAccounts(data: any) {
    const { id } = data

    await Promise.allSettled([
      this.getChannelById(id),
      this.fetchChannelTwitter(id, data.twitter),
    ])
  }

  public async fetchChannelTwitter(id: string, username: string) {
    if (!username) {
      return
    }
    try {
      const user = await this.twitterUserControllerService.getOneByScreenName(username, { fromDb: true })
      await this.holodexChannelAccountService.add({
        channelId: id,
        accountType: HolodexChannelAccountType.TWITTER,
        accountId: user.id,
      })
    } catch (error) {
      this.logger.error(`fetchChannelTwitter: ${error.message}`, { id, username })
    }
  }
}
