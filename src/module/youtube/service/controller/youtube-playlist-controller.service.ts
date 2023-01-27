import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { YoutubePlaylistApiService } from '../api/youtube-playlist-api.service'
import { YoutubePlaylistService } from '../data/youtube-playlist.service'

@Injectable()
export class YoutubePlaylistControllerService {
  private readonly logger = baseLogger.child({ context: YoutubePlaylistControllerService.name })

  constructor(
    @Inject(YoutubePlaylistService)
    private readonly youtubePlaylistService: YoutubePlaylistService,
    @Inject(YoutubePlaylistApiService)
    private readonly youtubePlaylistApiService: YoutubePlaylistApiService,
  ) { }
}
