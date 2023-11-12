import { Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { Fleetline } from '../../interface/twitter-fleet.interface'
import { TwitterBroadcastControllerService } from '../controller/twitter-broardcast-controller.service'
import { TwitterFleetlineTrackingService } from './twitter-fleetline-tracking.service'

@Injectable()
export class TwitterBroadcastTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterBroadcastTrackingService.name })

  constructor(
    @Inject(TwitterBroadcastControllerService)
    private readonly twitterBroadcastControllerService: TwitterBroadcastControllerService,
    @Inject(TwitterFleetlineTrackingService)
    private readonly twitterFleetlineTrackingService: TwitterFleetlineTrackingService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.twitterFleetlineTrackingService.once('response', (response) => this.onceFleetlineResponse(response))
  }

  // #region Fleetline

  private addFleetlineListeners() {
    this.twitterFleetlineTrackingService.on('data', (data) => this.onFleetlineData(data))
  }

  private async onceFleetlineResponse(response: any) {
    this.addFleetlineListeners()

    if (response.data) {
      await this.onFleetlineData(response.data)
    }
  }

  private async onFleetlineData(data: Fleetline) {
    try {
      const broadcastIds = data.threads
        .map((v) => v.live_content?.livevideo?.id)
        .filter((v) => v) || []
      if (!broadcastIds.length) {
        return
      }
      await this.getNewBroadcasts(broadcastIds)
    } catch (error) {
      this.logger.error(`onFleetlineData: ${error.message}`)
    }
  }

  // #endregion

  // #region Get

  private async getNewBroadcasts(curBroadcastIds: string[]) {
    if (!curBroadcastIds?.length) {
      return
    }

    this.logger.debug('getNewBroadcasts', { count: curBroadcastIds.length, ids: curBroadcastIds })
    await this.twitterBroadcastControllerService.fetchByIds(curBroadcastIds)
  }

  // #endregion
}
