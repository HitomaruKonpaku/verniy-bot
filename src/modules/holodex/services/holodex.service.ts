import { Inject, Injectable } from '@nestjs/common'
import { ETwitterStreamEvent, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { TwitterTweetTrackingService } from '../../twitter/services/tracking/twitter-tweet-tracking.service'
import { TwitterUtils } from '../../twitter/utils/twitter.utils'
import { HolodexApiService } from './api/holodex-api.service'

@Injectable()
export class HolodexService {
  private readonly logger = baseLogger.child({ context: HolodexService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(HolodexApiService)
    private readonly holodexApiService: HolodexApiService,
    @Inject(TwitterTweetTrackingService)
    private readonly twitterTweetTrackingService: TwitterTweetTrackingService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.addListeners()
  }

  private addListeners() {
    if (this.configService.twitter.tweet) {
      this.logger.info('Listen to tweets')
      this.twitterTweetTrackingService.on(ETwitterStreamEvent.Data, (data) => this.onTweetData(data))
    }
  }

  private async onTweetData(data: TweetV2SingleStreamResult) {
    const urls = TwitterUtils.getTweetEntityUrls(data)
    if (!urls.length) {
      return
    }

    const patterns = ['youtube.com/watch', 'youtu.be']
    const filterUrls = urls.filter((url) => patterns.some((v) => url.includes(v)))
    if (!filterUrls.length) {
      return
    }

    this.logger.debug('onTweetData', { urls: filterUrls })
    await Promise.allSettled(filterUrls.map((url) => this.postNotice(url)))
  }

  private async postNotice(url: string) {
    if (!this.holodexApiService.apiKey) {
      return
    }

    try {
      const { status, data } = await this.holodexApiService.notice(url)
      this.logger.info('postNotice', { url, status, data })
    } catch (error) {
      this.logger.error(`postNotice: ${error.message}`, { url, status: error.response?.status })
    }
  }
}
