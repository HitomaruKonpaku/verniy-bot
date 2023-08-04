import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { HolodexEntityUtil } from '../../util/holodex-entity.util'
import { HolodexApiService } from '../api/holodex-api.service'
import { HolodexVideoService } from '../data/holodex-video.service'

@Injectable()
export class HolodexVideoControllerService {
  private readonly logger = baseLogger.child({ context: HolodexVideoControllerService.name })

  constructor(
    @Inject(HolodexVideoService)
    private readonly holodexVideoService: HolodexVideoService,
    @Inject(HolodexApiService)
    private readonly holodexApiService: HolodexApiService,
  ) { }

  public async getVideoById(id: string) {
    const { data } = await this.holodexApiService.getVideoById(id)
    const video = await this.holodexVideoService.save(HolodexEntityUtil.buildVideo(data))
    return video
  }
}
