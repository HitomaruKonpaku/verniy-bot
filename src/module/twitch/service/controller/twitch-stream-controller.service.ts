import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchGameService } from '../data/twitch-game.service'
import { TwitchStreamService } from '../data/twitch-stream.service'

@Injectable()
export class TwitchStreamControllerService {
  private readonly logger = baseLogger.child({ context: TwitchStreamControllerService.name })

  constructor(
    @Inject(TwitchStreamService)
    private readonly twitchStreamService: TwitchStreamService,
    @Inject(TwitchGameService)
    private readonly twitchGameService: TwitchGameService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }

  public async saveStream(data: any) {
    const stream = await this.twitchStreamService.save({
      id: data.id,
      isActive: true,
      createdAt: new Date(data.started_at).getTime(),
      userId: data.user_id,
      gameId: data.game_id,
      type: data.type,
      title: data.title,
      language: data.language,
      isMature: data.is_mature || false,
    })

    stream.thumbnailUrl = data.thumbnail_url

    if (data.game_id) {
      try {
        stream.game = await this.twitchGameService.saveGame({
          id: data.game_id,
          name: data.game_name,
        })
      } catch (error) {
        this.logger.error(`saveStream#saveGame: ${error.message}`, { data })
      }
    }

    return stream
  }
}
