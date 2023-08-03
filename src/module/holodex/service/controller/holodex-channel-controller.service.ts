import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { HolodexChannelService } from '../data/holodex-channel.service'

@Injectable()
export class HolodexChannelControllerService {
  private readonly logger = baseLogger.child({ context: HolodexChannelControllerService.name })

  constructor(
    @Inject(HolodexChannelService)
    private readonly holodexChannelService: HolodexChannelService,
  ) { }
}
