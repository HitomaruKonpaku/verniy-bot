import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeVideoApiService } from '../api/youtube-video-api.service'
import { YoutubeVideoService } from '../data/youtube-video.service'

@Injectable()
export class YoutubeVideoControllerService {
  private readonly logger = baseLogger.child({ context: YoutubeVideoControllerService.name })

  constructor(
    @Inject(YoutubeVideoService)
    private readonly youtubeVideoService: YoutubeVideoService,
    @Inject(YoutubeVideoApiService)
    private readonly youtubeVideoApiService: YoutubeVideoApiService,
  ) { }
}
