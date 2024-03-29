import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'

@Injectable()
export class YoutubeLiveTrackingService {
  private readonly logger = baseLogger.child({ context: YoutubeLiveTrackingService.name })

  public async start() {
    this.logger.info('Starting...')
  }
}
