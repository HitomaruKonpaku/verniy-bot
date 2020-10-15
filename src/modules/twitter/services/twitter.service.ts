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
      this.checkProfiles()
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

  private checkProfiles() {
    const isEnabled = this.environmentService.getBoolean(TwitterConstants.CHECK_PROFILES_ENABLED_KEY)
    if (!isEnabled) {
      return
    }

    const config = this.twitterDataService.getProfileConfig()
    Object.freeze(config)

    const ids = Object.keys(config).filter(v => config[v].interval > 0)
    if (!ids.length) {
      return
    }
    this._logger.log('Checking profiles...')

    const api = 'users/show'
    this._logger.log('API requests per 15 minutes (Max 900): ' + ids.reduce((p, v) => p + Math.floor(900 / config[v].interval), 0))
    this._logger.log('User<Interval>: ' + ids.map(v => v + '<' + config[v].interval + '>').join(', '))

    ids.forEach(async (id: string) => {
      const interval = config[id].interval
      let profile: { imageUrl: string, bannerUrl: string }

      const checkUserProfile = async () => {
        try {
          const res = await this.client.get(api, { user_id: id, include_entities: false })
          const user = res.data as Twit.Twitter.User
          const imageUrl = user.profile_image_url_https
          const bannerUrl = user.profile_banner_url
          if (!profile) {
            profile = { imageUrl, bannerUrl }
          } else {
            if (profile.imageUrl !== imageUrl) {
              profile.imageUrl = imageUrl
              this.emit(TwitterEventConstants.PROFILE_IMAGE_CHANGED, user, config[id])
            }
            if (profile.imageUrl !== imageUrl) {
              profile.bannerUrl = bannerUrl
              this.emit(TwitterEventConstants.PROFILE_BANNER_CHANGED, user, config[id])
            }
          }
        } catch (error) {
          this._logger.error(error.message)
        }

        setTimeout(async () => {
          await checkUserProfile()
        }, interval * 1000)
      }

      await checkUserProfile()
    })
  }
}
