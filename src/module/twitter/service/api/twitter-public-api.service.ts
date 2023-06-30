import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { TwitterApi } from '../../api/twitter.api'

@Injectable()
export class TwitterPublicApiService {
  protected readonly logger = baseLogger.child({ context: TwitterPublicApiService.name })

  constructor(
    @Inject(forwardRef(() => TwitterApi))
    protected readonly api: TwitterApi,
  ) { }
}
