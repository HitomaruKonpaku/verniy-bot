import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
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
}
