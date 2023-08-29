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

  private get limit() {
    return this.configVarService.getNumber('TWITTER_CRON_TWEET_LIMIT')
  }

  protected async onTick() {
    this.checkTweets()
  }

  private async getTweets() {
    const tweets = await this.twitterTweetService.getManyForCheck({ limit: this.limit })
    return tweets
  }

  private async checkTweets() {
    try {
      const tweets = await this.getTweets()
      this.logger.debug('checkTweets', { spaceCount: tweets.length })
      const limiter = new Bottleneck({ maxConcurrent: this.maxConcurrent })
      await Promise.allSettled(tweets.map((v) => limiter.schedule(() => this.checkTweet(v))))
    } catch (error) {
      this.logger.error(`checkTweets: ${error.message}`)
    }
  }

  private async checkTweet(tweet: TwitterTweet) {
    try {
      await this.twitterTweetControllerService.getByTweetResultByRestId(tweet.id)
    } catch (error) {
      this.logger.error(`checkTweet: ${error.message}`, { id: tweet.id })
    }
  }
}
