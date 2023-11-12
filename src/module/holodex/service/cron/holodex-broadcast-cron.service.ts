/* eslint-disable class-methods-use-this */

import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/service/discord.service'
import { TwitterUtil } from '../../../twitter/util/twitter.util'
import { HolodexExternalStreamType } from '../../enum/holodex-external-stream-type.enum'
import { HolodexBroadcast } from '../../interface/holodex-broadcast.interface'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexBroadcastService } from '../data/external/holodex-broadcast.service'
import { HolodexExternalStreamService } from '../data/holodex-external-stream.service'
import { HolodexVideoService } from '../data/holodex-video.service'
import { HolodexBaseCronService } from './base/holodex-base-cron.service'

@Injectable()
export class HolodexBroadcastCronService extends HolodexBaseCronService<HolodexBroadcast> {
  protected readonly logger = baseLogger.child({ context: HolodexBroadcastCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  constructor(
    @Inject(HolodexApiService)
    protected readonly holodexApiService: HolodexApiService,
    @Inject(HolodexVideoService)
    protected readonly holodexVideoService: HolodexVideoService,
    @Inject(HolodexExternalStreamService)
    protected readonly holodexExternalStreamService: HolodexExternalStreamService,
    @Inject(forwardRef(() => DiscordService))
    protected readonly discordService: DiscordService,
    @Inject(HolodexBroadcastService)
    private readonly holodexBroadcastService: HolodexBroadcastService,
  ) {
    super(holodexApiService, holodexVideoService, holodexExternalStreamService, discordService)
  }

  public getType(): HolodexExternalStreamType {
    return HolodexExternalStreamType.TWITTER_BROADCAST
  }

  public async getItems(): Promise<HolodexBroadcast[]> {
    const items = await this.holodexBroadcastService.getManyLive()
    return items
  }

  protected getItemTitle(item: HolodexBroadcast): string {
    let title = item.title || `${item.user.username}'s Broadcast`
    if (title.length < this.TITLE_MIN_LENGTH) {
      title = `Broadcast: ${item.title}`
    }
    title = title.slice(0, this.TITLE_MAX_LENGTH)
    return title
  }

  protected getItemUrl(item: HolodexBroadcast): string {
    const url = TwitterUtil.getBroadcastUrl(item.id)
    return url
  }

  protected getItemThumbnailUrl(item: HolodexBroadcast): string {
    const url = item.imageUrl || item.user.profileImageUrl
    return url
  }

  protected getItemLiveTime(item: HolodexBroadcast): string {
    const time = new Date(item.startedAt).toISOString()
    return time
  }

  protected getItemDuration(item: HolodexBroadcast): number {
    const duration = Math.floor((Date.now() - item.startedAt) / 1000) + this.extraDurationSec
    return duration
  }

  protected getVideoCreatedAt(item: HolodexBroadcast): number {
    return item.startedAt
  }
}
