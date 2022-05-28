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
}
