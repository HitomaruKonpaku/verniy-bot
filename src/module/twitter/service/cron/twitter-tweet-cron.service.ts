import { Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'

@Injectable()
export class TwitterTweetCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterTweetCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  protected async onTick() {
    this.logger.debug('onTick')
  }
}
