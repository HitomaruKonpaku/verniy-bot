import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubeClientService } from '../youtube-client.service'

@Injectable()
export class YoutubeApiService {
  protected logger = baseLogger.child({ context: YoutubeApiService.name })

  protected maxResults = 50

  constructor(
    @Inject(YoutubeClientService)
    protected readonly youtubeClientService: YoutubeClientService,
  ) { }

  protected get youtube() {
    return this.youtubeClientService.youtube
  }
}
