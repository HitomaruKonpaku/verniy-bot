import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubePlaylistItemApiService } from '../api/youtube-playlist-item-api.service'
import { YoutubePlaylistItemService } from '../data/youtube-playlist-item.service'

@Injectable()
export class YoutubePlaylistItemControllerService {
  private readonly logger = baseLogger.child({ context: YoutubePlaylistItemControllerService.name })

  constructor(
    @Inject(YoutubePlaylistItemService)
    private readonly youtubePlaylistItemService: YoutubePlaylistItemService,
    @Inject(YoutubePlaylistItemApiService)
    private readonly youtubePlaylistItemApiService: YoutubePlaylistItemApiService,
  ) { }
}
