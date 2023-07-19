import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { EventEmitter } from 'events'

import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/service/config.service'
import { TwitterApi } from '../../api/twitter.api'
import { TwitterEvent } from '../../enum/twitter-event.enum'
import { TwitterTweetUtil } from '../../util/twitter-tweet.util'
import { TwitterFilteredStreamUserService } from '../data/twitter-filtered-stream-user.service'

@Injectable()
export class TwitterTweetTrackingProfileTweetService extends EventEmitter {
  protected readonly logger = baseLogger.child({ context: TwitterTweetTrackingProfileTweetService.name })

  private interval = 60000
  private withReplies = false

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TwitterApi)
    private readonly twitterApi: TwitterApi,
    @Inject(TwitterFilteredStreamUserService)
    private readonly twitterFilteredStreamUserService: TwitterFilteredStreamUserService,
  ) {
    super()
    this.interval = this.configService.twitter?.tweet?.interval
  }

  public listen() {
    this.tick()
  }

  private async tick() {
    try {
      await this.checkUsers()
    } catch (error) {
      // ignore
    }

    setTimeout(() => {
      this.withReplies = !this.withReplies
      this.tick()
    }, this.interval)
  }

  private async getUsers() {
    const users = await this.twitterFilteredStreamUserService.getUsersForInitRules()
    return users
  }

  private async checkUsers() {
    const users = await this.getUsers()
    this.logger.debug('checkUsers', { count: users.length })
    if (!users.length) {
      return
    }

    const limiter = new Bottleneck({ maxConcurrent: 1 })
    await Promise.allSettled(users.map((user) => limiter.schedule(() => this.fetchUser(user.id))))
  }

  private async fetchUser(userId: string) {
    try {
      const { data } = this.withReplies
        ? await this.twitterApi.graphql.UserWithProfileTweetsAndRepliesQueryV2(userId)
        : await this.twitterApi.graphql.UserWithProfileTweetsQueryV2(userId)
      const results = TwitterTweetUtil.parseUserWithProfileTweets(data?.data)
      this.emit(TwitterEvent.TWEET_RESULTS, results)
    } catch (error) {
      this.logger.error(`fetchUser: ${error.message}`, { userId })
    }
  }
}
