import { Inject, Injectable, forwardRef } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TwitterUtil } from '../../../twitter/util/twitter.util'
import { HolodexExternalStreamType } from '../../enum/holodex-external-stream-type.enum'
import { HolodexSpace } from '../../interface/holodex-space.interface'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexExternalStreamService } from '../data/holodex-external-stream.service'
import { HolodexSpaceService } from '../data/holodex-space.service'
import { HolodexVideoService } from '../data/holodex-video.service'

@Injectable()
export class HolodexSpaceCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: HolodexSpaceCronService.name })

  protected cronTime = '0 */1 * * * *'
  protected cronRunOnInit = true

  private bonusDurationSec = 120

  constructor(
    @Inject(HolodexSpaceService)
    private readonly holodexSpaceService: HolodexSpaceService,
    @Inject(HolodexVideoService)
    private readonly holodexVideoService: HolodexVideoService,
    @Inject(HolodexExternalStreamService)
    private readonly holodexExternalStreamService: HolodexExternalStreamService,
    @Inject(HolodexApiService)
    private readonly holodexApiService: HolodexApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    super()
  }

  protected async onTick() {
    await this.notifySpaces()
  }

  private async notifySpaces() {
    try {
      const spaces = await this.holodexSpaceService.getManyLive()
      if (spaces.length) {
        this.logger.debug('notifySpaces', { count: spaces.length, ids: spaces.map((v) => v.id) })
        const limiter = new Bottleneck({ maxConcurrent: 1 })
        await Promise.allSettled(spaces.map((v) => limiter.schedule(() => this.notifySpace(v))))
      }
    } catch (error) {
      this.logger.error(`notifySpaces: ${error.message}`)
    }
  }

  private calcDuration(space: HolodexSpace) {
    const duration = Math.floor((Date.now() - space.startedAt) / 1000) + this.bonusDurationSec
    return duration
  }

  private async notifySpace(space: HolodexSpace) {
    try {
      const owner = await this.discordService.getOwner()
      const body = {
        id: space.holodexExternalStream?.id,
        channel_id: space.holodexChannelAccount.channelId,
        title: {
          name: space.title,
          link: TwitterUtil.getSpaceUrl(space.id),
          thumbnail: space.creator.profileImageUrl,
          placeholderType: 'external-stream',
          certainty: 'certain',
          credits: {
            bot: {
              link: 'https://discord.gg/A24AbzgvRJ',
              name: owner.username,
              user: owner.username,
            },
          },
        },
        liveTime: new Date(space.startedAt).toISOString(),
        duration: this.calcDuration(space),
      }

      const { data } = await this.holodexApiService.postVideoPlaceholder(body)
      if (data.error) {
        const { placeholder } = data
        if (placeholder) {
          this.logger.error(`notifySpace#placeholder: ${data.error}`, {
            id: space.id,
            placeholder: {
              id: placeholder.id,
              link: placeholder.link,
            },
          })
          body.id = placeholder.id
          await this.holodexApiService.postVideoPlaceholder(body)
          await this.updateVideoSpace(placeholder, space)
          return
        }

        this.logger.error(`notifySpace#response: ${data.error}`, { id: space.id })
        return
      }

      if (!space.holodexExternalStream) {
        const limiter = new Bottleneck({ maxConcurrent: 1 })
        await Promise.allSettled(data.map((v) => limiter.schedule(() => this.createVideoSpace(v, space))))
      }
    } catch (error) {
      this.logger.error(`notifySpace: ${error.message}`, { id: space.id })
    }
  }

  private async createVideoSpace(data: any, space: HolodexSpace) {
    await this.holodexVideoService.save({
      id: data.id,
      createdAt: space.startedAt,
      channelId: data.channel_id,
      type: data.type,
    })
    await this.holodexExternalStreamService.add({
      id: data.id,
      createdAt: space.startedAt,
      type: HolodexExternalStreamType.TWITTER_SPACE,
      sourceId: space.id,
    })
  }

  public async updateVideoSpace(data: any, space: HolodexSpace) {
    await this.holodexVideoService.updateFields(data.id, {
      createdAt: space.startedAt,
    })
    await this.holodexExternalStreamService.updateFields(data.id, {
      createdAt: space.startedAt,
      sourceId: space.id,
    })
  }
}
