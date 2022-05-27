import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitchApiService } from './api/twitch-api.service'

@Injectable()
export class TwitchService {
  private readonly logger = baseLogger.child({ context: TwitchService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitchApiService)
    private readonly twitchApiService: TwitchApiService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
  }
}
