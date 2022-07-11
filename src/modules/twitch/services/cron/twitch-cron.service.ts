import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'

@Injectable()
export class TwitchCronService {
  private readonly logger = baseLogger.child({ context: TwitchCronService.name })

  public async start() {
    this.logger.info('Starting...')
  }
}
