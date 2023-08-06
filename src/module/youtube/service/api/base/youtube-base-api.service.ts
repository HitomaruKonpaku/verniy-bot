import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../../logger'
import { YoutubeApiClientService } from '../client/youtube-api-client.service'

@Injectable()
export class YoutubeBaseApiService {
  protected logger = baseLogger.child({ context: YoutubeBaseApiService.name })

  protected maxResults = 50

  constructor(
    @Inject(YoutubeApiClientService)
    protected readonly youtubeApiClientService: YoutubeApiClientService,
  ) { }

  protected get youtube() {
    return this.youtubeApiClientService.youtube
  }
}
