import { Injectable } from '@nestjs/common'

import { TwitterBroadcastApi } from './api/twitter-broadcast.api'
import { TwitterFleetApi } from './api/twitter-fleet.api'
import { TwitterGraphqlApi } from './api/twitter-graphql.api'
import { TwitterGuestApi } from './api/twitter-guest.api'
import { TwitterLiveVideoStreamApi } from './api/twitter-live-video-stream.api'
import { TwitterApiData } from './twitter.api.data'

@Injectable()
export class TwitterApi {
  public data: TwitterApiData

  public graphql: TwitterGraphqlApi
  public fleet: TwitterFleetApi
  public guest: TwitterGuestApi
  public broadcast: TwitterBroadcastApi
  public liveVideoStream: TwitterLiveVideoStreamApi

  constructor() {
    this.createData()
    this.createApis()
  }

  private createData() {
    this.data = new TwitterApiData(this)
  }

  private createApis() {
    this.graphql = new TwitterGraphqlApi(this, 'graphql')
    this.fleet = new TwitterFleetApi(this, 'fleets/v1')
    this.guest = new TwitterGuestApi(this, '1.1/guest')
    this.broadcast = new TwitterBroadcastApi(this, '1.1/broadcasts')
    this.liveVideoStream = new TwitterLiveVideoStreamApi(this, '1.1/live_video_stream')
  }
}
