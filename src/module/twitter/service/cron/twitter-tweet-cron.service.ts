import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { baseLogger } from '../../../../logger'
import { BaseCronService } from '../../../../shared/service/base-cron.service'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { TwitterTweet } from '../../model/twitter-tweet.entity'
import { TwitterTweetControllerService } from '../controller/twitter-tweet-controller.service'
import { TwitterTweetService } from '../data/twitter-tweet.service'

@Injectable()
export class TwitterTweetCronService extends BaseCronService {
  protected readonly logger = baseLogger.child({ context: TwitterTweetCronService.name })

  protected cronTime = '0 */1 * * * *'
  // protected cronRunOnInit = true

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterTweetControllerService)
    private readonly twitterTweetControllerService: TwitterTweetControllerService,
  ) {
    super()
    this.cronTime = this.configVarService.getString('TWITTER_CRON_TWEET_EXPRESSION')
  }

  private get maxConcurrent() {
    return this.configVarService.getNumber('TWITTER_CRON_TWEET_MAX_CONCURRENT')
  }

  protected async onTick() {
    await this.getTweetsByTweetResultByRestId()
    await this.getTweetsByTweetDetail()
  }

  private async getTweets(limit: number) {
    const tweets = await this.twitterTweetService.getManyForCheck({ limit })
    return tweets
  }

  private async getTweetsByTweetResultByRestId() {
    try {
      const limit = this.configVarService.getNumber('TWITTER_CRON_TWEET_LIMIT')
      if (limit <= 0) {
        return
      }

      const tweets = await this.getTweets(limit)
      this.logger.debug('getTweetsByTweetResultByRestId', { count: tweets.length })

      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(tweets.map((v) => limiter.schedule(() => this.getTweetResultByRestId(v))))
    } catch (error) {
      this.logger.error(`getTweetsByTweetResultByRestId: ${error.message}`)
    }
  }

  private async getTweetsByTweetDetail() {
    try {
      const limit = this.configVarService.getNumber('TWITTER_CRON_TWEET_LIMIT_2')
      if (limit <= 0) {
        return
      }

      const tweets = await this.getTweets(limit)
      this.logger.debug('getTweetsBygetTweetDetail', { count: tweets.length })

      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(tweets.map((v) => limiter.schedule(() => this.getTweetDetail(v))))
    } catch (error) {
      this.logger.error(`getTweetsBygetTweetDetail: ${error.message}`)
    }
  }

  private async getTweetDetail(tweet: TwitterTweet) {
    try {
      await this.twitterTweetControllerService.getByTweetDetail(tweet.id)
    } catch (error) {
      this.logger.error(`getTweetDetail: ${error.message}`, { id: tweet.id })
    }
  }

  private async getTweetResultByRestId(tweet: TwitterTweet) {
    try {
      await this.twitterTweetControllerService.getByTweetResultByRestId(tweet.id)
    } catch (error) {
      this.logger.error(`getTweetResultByRestId: ${error.message}`, { id: tweet.id })
    }
  }
}
