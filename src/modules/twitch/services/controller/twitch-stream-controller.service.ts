import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../../logger'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchStreamService } from '../data/twitch-stream.service'

@Injectable()
export class TwitchStreamControllerService {
  private readonly logger = baseLogger.child({ context: TwitchStreamControllerService.name })

  constructor(
    @Inject(TwitchStreamService)
    private readonly twitchStreamService: TwitchStreamService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }

  public async saveStream(data: any) {
    const stream = await this.twitchStreamService.save({
      id: data.id,
      isActive: true,
      createdAt: new Date(data.started_at).getTime(),
      userId: data.user_id,
      gameId: data.game_id || null,
      type: data.type || null,
      title: data.title || null,
      isMature: data.is_mature || false,
    })
    return stream
  }
}
