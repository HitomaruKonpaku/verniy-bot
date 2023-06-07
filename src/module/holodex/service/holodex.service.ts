import { Inject, Injectable } from '@nestjs/common'
import { ETwitterStreamEvent, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { TwitterEvent } from '../../twitter/enum/twitter-event.enum'
import { TwitterTweet } from '../../twitter/model/twitter-tweet.entity'
import { TwitterTweetTrackingService } from '../../twitter/service/tracking/twitter-tweet-tracking.service'
import { TwitterUtil } from '../../twitter/util/twitter.util'
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
      this.twitterTweetTrackingService.on(TwitterEvent.TWEET, (tweet) => this.onTweet(tweet))
    }
  }

  private async onTweet(tweet: TwitterTweet) {
    const urls = TwitterUtil.getTweetEntityUrls(tweet)
    const tweetUrl = TwitterUtil.getTweetUrl(tweet.author.username, tweet.id)
    await this.handleYouTubeUrls(urls, tweetUrl)
  }

  private async onTweetData(data: TweetV2SingleStreamResult) {
    const urls = TwitterUtil.getTweetV2EntityUrls(data)
    const author = data.includes.users.find((v) => v.id === data.data.author_id)
    const tweetUrl = TwitterUtil.getTweetUrl(author.username, data.data.id)
    await this.handleYouTubeUrls(urls, tweetUrl)
  }

  private async handleYouTubeUrls(urls: string[], tweetUrl: string) {
    if (!urls?.length) {
      return
    }

    this.logger.debug('handleYouTubeUrls#orig', {
      tweetUrl,
      urls,
    })

    const patterns = ['youtube.com', 'youtu.be']
    const filterUrls = urls
      .filter((url) => patterns.some((v) => url.includes(v)))
      .map((url) => {
        if (url.includes('/shorts/')) {
          return url
            .replace('?feature=share', '')
            .replace('/shorts/', '/watch?v=')
        }
        return url
      })
      .filter((url) => url)
    if (!filterUrls.length) {
      return
    }

    this.logger.debug('handleYouTubeUrls#filter', {
      tweetUrl,
      urls: filterUrls,
    })

    await Promise.allSettled(filterUrls.map((url) => this.notice(url)))
  }

  private async notice(url: string) {
    if (!this.holodexApiService.apiKey) {
      return
    }

    try {
      const { status, data } = await this.holodexApiService.notice(url)
      this.logger.info('notice', { url, status, data })
    } catch (error) {
      this.logger.error(`notice: ${error.message}`, { url, status: error.response?.status })
    }
  }
}
