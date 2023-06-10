import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ArrayUtil } from '../../../../util/array.util'
import { YOUTUBE_API_LIST_SIZE } from '../../constant/youtube.constant'
import { YoutubeChannelControllerService } from '../controller/youtube-channel-controller.service'
import { YoutubeChannelService } from '../data/youtube-channel.service'

@Injectable()
export class YoutubeChannelCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: YoutubeChannelCronService.name })

  protected cronTime = '0 0 */1 * * *'

  constructor(
    @Inject(YoutubeChannelService)
    private readonly youtubeChannelService: YoutubeChannelService,
    @Inject(YoutubeChannelControllerService)
    protected readonly youtubeChannelControllerService: YoutubeChannelControllerService,
  ) {
    super()
  }

  protected async onTick() {
    await this.checkChannels()
  }

  private async checkChannels() {
    this.logger.debug('checkChannels')
    try {
      const channels = await this.youtubeChannelService.getAll()
      if (!channels.length) {
        return
      }
      const ids = channels.map((v) => v.id)
      const idChunks = ArrayUtil.splitIntoChunk(ids, YOUTUBE_API_LIST_SIZE)
      await Promise.allSettled(idChunks.map((v) => this.youtubeChannelControllerService.getManyByIds(v, true)))
    } catch (error) {
      this.logger.error(`checkChannels: ${error.message}`)
    }
  }
}
