import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { HolodexChannel } from '../../model/holodex-channel.entity'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexChannelService } from '../data/holodex-channel.service'

@Injectable()
export class HolodexChannelControllerService {
  private readonly logger = baseLogger.child({ context: HolodexChannelControllerService.name })

  constructor(
    @Inject(HolodexChannelService)
    private readonly holodexChannelService: HolodexChannelService,
    @Inject(HolodexApiService)
    private readonly holodexApiService: HolodexApiService,
  ) { }

  public async getChannels(params?: Record<string, any>) {
    const { data } = await this.holodexApiService.getChannels(params)
    const channels = data.map((v) => {
      const obj: HolodexChannel = {
        id: v.id,
        createdAt: 0,
        updatedAt: Date.now(),
        type: v.type,
        name: v.name,
        org: v.org,
        suborg: v.suborg,
        group: v.group,
      }
      return obj
    })
    await this.holodexChannelService.saveAll(channels)
    return channels
  }

  public async getOrgChannels(org: string) {
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
    } while (count)

    return channels
  }
}
