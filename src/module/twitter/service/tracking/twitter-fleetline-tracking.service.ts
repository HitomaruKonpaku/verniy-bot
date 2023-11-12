import { Inject, Injectable } from '@nestjs/common'
import { EventEmitter } from 'events'

import { baseLogger } from '../../../../logger'
import { TwitterApi } from '../../api/twitter.api'
import { Fleetline } from '../../interface/twitter-fleet.interface'

@Injectable()
export class TwitterFleetlineTrackingService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterFleetlineTrackingService.name })

  constructor(
    @Inject(TwitterApi)
    private readonly twitterApi: TwitterApi,
  ) {
    super()
  }

  public start() {
    if (!process.env.TWITTER_AUTH_TOKEN) {
      this.logger.warn('TWITTER_AUTH_TOKEN not found')
      return
    }

    this.logger.info('Starting...')
    this.requestFleetline()
  }

  private async requestFleetline() {
    await this.getFleetline()

    const interval = 60E3
    setTimeout(() => this.requestFleetline(), interval)
  }

  private async getFleetline(): Promise<Fleetline> {
    try {
      const { data } = await this.twitterApi.fleet.fleetline()
      this.emit('data', data)
      this.emit('response', { data })
      return data
    } catch (error) {
      this.logger.error(`getFleetline: ${error.message}`)
      this.emit('error', error)
      this.emit('response', { error })
    }
    return null
  }
}
