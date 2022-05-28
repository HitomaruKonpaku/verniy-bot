import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../../logger'
import { TwitchApiService } from '../api/twitch-api.service'
import { TwitchUserService } from '../data/twitch-user.service'

@Injectable()
export class TwitchUserControllerService {
  private readonly logger = baseLogger.child({ context: TwitchUserControllerService.name })

  constructor(
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }
}
