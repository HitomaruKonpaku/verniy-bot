import Bottleneck from 'bottleneck'
import { BaseCronService } from '../../../../../shared/service/base-cron.service'
import { BaseExternalEntity } from '../../../../database/model/base-external.entity'
import { DiscordService } from '../../../../discord/service/discord.service'
import { HolodexExternalStreamType } from '../../../enum/holodex-external-stream-type.enum'
import { HolodexItem } from '../../../interface/holodex.interface'
import { HolodexApiService } from '../../api/holodex-api.service'
import { HolodexExternalStreamService } from '../../data/holodex-external-stream.service'
import { HolodexVideoService } from '../../data/holodex-video.service'

export abstract class HolodexBaseCronService<T extends BaseExternalEntity> extends BaseCronService {
  protected readonly TITLE_MIN_LENGTH = 4
  protected readonly TITLE_MAX_LENGTH = 120

  protected extraDurationSec = 120

  constructor(
    protected readonly holodexApiService: HolodexApiService,
    protected readonly holodexVideoService: HolodexVideoService,
    protected readonly holodexExternalStreamService: HolodexExternalStreamService,
    protected readonly discordService: DiscordService,
  ) {
    super()
  }

  public abstract getType(): HolodexExternalStreamType

  public abstract getItems(): Promise<T[]>

  protected abstract getItemTitle(item: T): string

  protected abstract getItemUrl(item: T): string

  protected abstract getItemThumbnailUrl(item: T): string

  protected abstract getItemLiveTime(item: T): string

  protected abstract getItemDuration(item: T): number

  protected abstract getVideoCreatedAt(item: T): number

  protected async onTick() {
    try {
      const items = await this.getItems()
      if (!items?.length) {
        return
      }
      this.logger.debug('onTick', { count: items.length, ids: items.map((v) => v.id) })
      const limiter = new Bottleneck({ maxConcurrent: 1 })
      await Promise.allSettled(items.map((v) => limiter.schedule(() => this.notifyItem(v))))
    } catch (error) {
      this.logger.error(`onTick: ${error.message}`)
    }
  }

  protected async notifyItem(item: T & HolodexItem) {
    try {
      const owner = await this.discordService.getOwner()
      const body = {
        id: item.holodexExternalStream?.id,
        channel_id: item.holodexChannelAccount.channelId,
        title: {
          name: this.getItemTitle(item),
          link: this.getItemUrl(item),
          thumbnail: this.getItemThumbnailUrl(item),
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
        liveTime: this.getItemLiveTime(item),
        duration: this.getItemDuration(item),
      }

      const { data } = await this.holodexApiService.postVideoPlaceholder(body)
      if (data.error) {
        const { placeholder } = data
        if (placeholder) {
          this.logger.error(`notifyItem#placeholder: ${data.error}`, {
            id: item.id,
            placeholder: {
              id: placeholder.id,
              link: placeholder.link,
            },
          })

          body.id = placeholder.id
          await this.holodexApiService.postVideoPlaceholder(body)
          await this.saveVideo(placeholder, item)
          return
        }

        this.logger.error(`notifyItem#response: ${data.error}`, { id: item.id })
        return
      }

      if (!item.holodexExternalStream) {
        const limiter = new Bottleneck({ maxConcurrent: 1 })
        await Promise.allSettled(data.map((v) => limiter.schedule(() => this.saveVideo(v, item))))
      }
    } catch (error) {
      const msg = [error.message, error.response?.data]
        .filter((v) => v)
        .join('. ')
      this.logger.error(`notifyItem: ${msg}`, { id: item.id })
    }
  }

  protected async saveVideo(data: any, item: T) {
    await this.holodexVideoService.save({
      id: data.id,
      createdAt: this.getVideoCreatedAt(item),
      channelId: data.channel_id,
      type: data.type,
    })
    await this.holodexExternalStreamService.add({
      id: data.id,
      createdAt: this.getVideoCreatedAt(item),
      type: this.getType(),
      sourceId: item.id,
    })
  }
}
