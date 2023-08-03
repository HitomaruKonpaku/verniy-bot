import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { HolodexVideoService } from '../data/holodex-video.service'

@Injectable()
export class HolodexVideoControllerService {
  private readonly logger = baseLogger.child({ context: HolodexVideoControllerService.name })

  constructor(
    @Inject(HolodexVideoService)
    private readonly holodexVideoService: HolodexVideoService,
  ) { }
}
