import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { EventEmitter } from 'events'
import * as Twit from 'twit'
import { EnvironmentService } from '../../environment/services/environment.service'
import { TwitterEventConstants } from '../constants/twitter-event.constants'
import { TwitterConstants } from '../constants/twitter.constants'
import { TwitterDataService } from './twitter-data.service'
import { TwitterEventService } from './twitter-event.service'

@Injectable()
export class TwitterService extends EventEmitter {
  private readonly _logger = new Logger(TwitterService.name)

  private _client: Twit

  public get client(): Twit {
    return this._client
  }

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => TwitterEventService))
    private readonly twitterEventService: TwitterEventService,
    private readonly twitterDataService: TwitterDataService,
  ) {
    super()
  }

  public start() {
    const isEnabled = this.environmentService.getBoolean(TwitterConstants.ENABLED_KEY)
    if (!isEnabled) {
      return
    }

    try {
      this.initClient()
      this.checkTweets()
    } catch (error) {
      this._logger.error(error.message)
    }
  }

  private initClient() {
    const consumerKey = this.environmentService.getValue(TwitterConstants.CONSUMER_KEY_KEY)
    const consumerSecret = this.environmentService.getValue(TwitterConstants.CONSUMER_SECRET_KEY)
    const accessToken = this.environmentService.getValue(TwitterConstants.ACCESS_TOKEN_KEY)
    const accessTokenSecret = this.environmentService.getValue(TwitterConstants.ACCESS_TOKEN_SECRET_KEY)

    if (this.environmentService.isDev) {
      this._logger.debug(`ConsumerKey: ${consumerKey}`)
      this._logger.debug(`ConsumerSecret: ${consumerSecret}`)
      this._logger.debug(`AccessToken: ${accessToken}`)
      this._logger.debug(`AccessTokenSecret: ${accessTokenSecret}`)
    }

    if ([consumerKey, consumerSecret, accessToken, accessTokenSecret].some(v => !v)) {
      throw new Error('Missing config keys')
    }

    this._client = new Twit({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
    })
  }

  private checkTweets() {
    const isEnabled = this.environmentService.getBoolean(TwitterConstants.CHECK_TWEETS_ENABLED_KEY)
    if (!isEnabled) {
      return
    }
    const config = this.twitterDataService.getTweetsConfig()
    Object.freeze(config)

    const follow = Object.keys(config).join(',')
    if (!follow.length) {
      return
    }

    this._logger.log('Checking tweets...')
    const path = 'statuses/filter'
    const params = { follow }
    const stream = this.client.stream(path, params)

    this.twitterEventService.on(TwitterEventConstants.TWEET, (tweet: Twit.Twitter.Status, config) => {
      this.emit(TwitterEventConstants.TWEET, tweet, config)
    })
    this.twitterEventService.attachStreamEvents(stream, config)
  }
}
