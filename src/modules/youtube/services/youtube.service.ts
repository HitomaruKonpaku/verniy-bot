import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'

@Injectable()
export class YoutubeService {
  private readonly logger = baseLogger.child({ context: YoutubeService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
  }
}
