import { Inject, Injectable } from '@nestjs/common'
import { logger as baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'

@Injectable()
export class TwitCastingService {
  private readonly logger = baseLogger.child({ context: TwitCastingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    // TODO
  }
}
