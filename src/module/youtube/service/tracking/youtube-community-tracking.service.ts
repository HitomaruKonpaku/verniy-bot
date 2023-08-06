import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'

@Injectable()
export class YoutubeCommunityTrackingService {
  private readonly logger = baseLogger.child({ context: YoutubeCommunityTrackingService.name })

  public async start() {
    this.logger.info('Starting...')
  }
}
