/* eslint-disable class-methods-use-this */

import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/service/discord.service'
import { TwitterUtil } from '../../../twitter/util/twitter.util'
import { HolodexExternalStreamType } from '../../enum/holodex-external-stream-type.enum'
import { HolodexSpace } from '../../interface/holodex-space.interface'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexSpaceService } from '../data/external/holodex-space.service'
import { HolodexExternalStreamService } from '../data/holodex-external-stream.service'
import { HolodexVideoService } from '../data/holodex-video.service'
import { HolodexBaseCronService } from './base/holodex-base-cron.service'

@Injectable()
export class HolodexSpaceCronService extends HolodexBaseCronService<HolodexSpace> {
  protected readonly logger = baseLogger.child({ context: HolodexSpaceCronService.name })

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
    @Inject(HolodexSpaceService)
    private readonly holodexSpaceService: HolodexSpaceService,
  ) {
    super(holodexApiService, holodexVideoService, holodexExternalStreamService, discordService)
  }

  public getType(): HolodexExternalStreamType {
    return HolodexExternalStreamType.TWITTER_SPACE
  }

  public async getItems(): Promise<HolodexSpace[]> {
    const items = await this.holodexSpaceService.getManyLive()
    return items
  }

  protected getItemTitle(item: HolodexSpace): string {
    let title = item.title || `${item.creator.username}'s Space`
    if (title.length < this.TITLE_MIN_LENGTH) {
      title = `Space: ${item.title}`
    }
    title = title.slice(0, this.TITLE_MAX_LENGTH)
    return title
  }

  protected getItemUrl(item: HolodexSpace): string {
    const url = TwitterUtil.getSpaceUrl(item.id)
    return url
  }

  protected getItemThumbnailUrl(item: HolodexSpace): string {
    const url = item.creator.profileImageUrl
    return url
  }

  protected getItemLiveTime(item: HolodexSpace): string {
    const time = new Date(item.startedAt).toISOString()
    return time
  }

  protected getItemDuration(item: HolodexSpace): number {
    const duration = Math.floor((Date.now() - item.startedAt) / 1000) + this.extraDurationSec
    return duration
  }

  protected getVideoCreatedAt(item: HolodexSpace): number {
    return item.startedAt
  }
}
