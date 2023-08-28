import { forwardRef, Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { hideLinkEmbed } from 'discord.js'
import { EventEmitter } from 'events'

import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitterTweetService } from '../../../track/service/track-twitter-tweet.service'
import { TwitterEvent } from '../../enum/twitter-event.enum'
import { Result } from '../../interface/twitter-tweet.interface'
import { TwitterTweet } from '../../model/twitter-tweet.entity'
import { TwitterUtil } from '../../util/twitter.util'
import { TwitterTweetControllerService } from '../controller/twitter-tweet-controller.service'
import { TwitterTweetService } from '../data/twitter-tweet.service'
import { TwitterTweetTrackingProfileTweetService } from './twitter-tweet-tracking-profile-tweet.service'

@Injectable()
export class TwitterTweetTrackingService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterTweetTrackingService.name })

  /**
   * Limit send per discord channel id
   */
  private readonly broadcastLimiter = new Bottleneck.Group({ maxConcurrent: 1 })

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
    @Inject(TwitterTweetService)
    private readonly twitterTweetService: TwitterTweetService,
    @Inject(TwitterTweetControllerService)
    private readonly twitterTweetControllerService: TwitterTweetControllerService,
    @Inject(TrackTwitterTweetService)
    private readonly trackTwitterTweetService: TrackTwitterTweetService,
    @Inject(TwitterTweetTrackingProfileTweetService)
    private readonly twitterTweetTrackingProfileTweetService: TwitterTweetTrackingProfileTweetService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    super()
  }

  public async start() {
    this.logger.info('Starting...')

    this.twitterTweetTrackingProfileTweetService.on(TwitterEvent.TWEET_RESULTS, (results) => {
      this.handleTweetResults(results)
    })

    this.twitterTweetTrackingProfileTweetService.listen()
  }

  private async handleTweetResults(results: Result[]) {
    try {
      const curTweetIds = results
        .map((v) => v.rest_id)
        .filter((v) => v)
      const oldTweetIds = await this.twitterTweetService.getManyByIds(curTweetIds).then((tweets) => tweets.map((tweet) => tweet.id))
      const newTweetIds = ArrayUtil.difference(curTweetIds, oldTweetIds)

      if (newTweetIds.length) {
        const limiter = new Bottleneck({ maxConcurrent: 1 })
        const newResults = results
          .filter((v) => v.rest_id && newTweetIds.includes(v.rest_id))
          .sort((a, b) => new Date(a.legacy.created_at).getTime() - new Date(b.legacy.created_at).getTime())
        await Promise.allSettled(newResults.map((result) => limiter.schedule(() => this.handleTweetResult(result))))
      }

      if (oldTweetIds.length) {
        const limiter = new Bottleneck({ maxConcurrent: 1 })
        const oldResults = results
          .filter((v) => v.rest_id && oldTweetIds.includes(v.rest_id))
        await Promise.allSettled(oldResults.map((result) => limiter.schedule(() => this.saveTweetResult(result))))
      }
    } catch (error) {
      this.logger.error(`handleTweetResults: ${error.message}`, { results })
    }
  }

  private async saveTweetResult(result: Result): Promise<TwitterTweet[]> {
    const tweet = await this.twitterTweetControllerService.saveTweet(result)
    const tweets = [tweet, tweet.retweetedStatus, tweet.quotedStatus]
      .filter((v) => v && v.isNew)
      .sort((a, b) => a.createdAt - b.createdAt)
    return tweets
  }

  private async handleTweetResult(result: Result) {
    try {
      const tweets = await this.saveTweetResult(result)
      await Promise.allSettled(tweets.map((v) => this.handleTweetData(v)))
    } catch (error) {
      this.logger.error(`handleTweetResult: ${error.message}`, { result })
    }
  }

  private async handleTweetData(tweet: TwitterTweet) {
    this.emit(TwitterEvent.TWEET, tweet)
    await this.broadcastTweet(tweet)
  }

  private async broadcastTweet(tweet: TwitterTweet) {
    if (Date.now() - tweet.createdAt > this.configVarService.getNumber('TWITTER_TWEET_MAX_AGE') * 1000) {
      return
    }

    const trackItems = await this.getTrackItemsByTweet(tweet)
    if (!trackItems.length) {
      return
    }

    try {
      const tweetUrl = TwitterUtil.getTweetUrlByTweet(tweet)
      this.logger.info(`broadcastTweet: ${tweetUrl}`)

      let content = tweetUrl
      try {
        if (tweet.inReplyToStatusId) {
          const icon = '💬'
          const origTweetUrl = tweet.inReplyToUser
            ? TwitterUtil.getTweetUrl(tweet.inReplyToUser.username, tweet.inReplyToStatusId)
            : TwitterUtil.getTweetUrlById(tweet.inReplyToStatusId)
          content = [
            origTweetUrl,
            `${icon} ${tweetUrl}`,
          ].join('\n')
        } else if (tweet.retweetedStatusId) {
          const icon = '🔁'
          const origTweetUrl = tweet.retweetedStatus
            ? TwitterUtil.getTweetUrlByTweet(tweet.retweetedStatus)
            : TwitterUtil.getTweetUrlById(tweet.retweetedStatusId)
          content = [
            hideLinkEmbed(origTweetUrl),
            `${icon} ${tweetUrl}`,
          ].join('\n')
        }
      } catch (error) {
        this.logger.error(`broadcastTweet: Parsing tweet error: ${error.message}`, { tweet })
      }

      trackItems.forEach((trackItem) => {
        const lines = [content]
        if (this.configVarService.getBoolean('TWITTER_TWEET_DISCORD_MESSAGE')) {
          lines.unshift(trackItem.discordMessage)
        }
        const channelContent = lines
          .filter((v) => v)
          .join('\n')
        this.broadcastLimiter
          .key(trackItem.discordChannelId)
          .schedule(() => this.discordService.sendToChannel(
            trackItem.discordChannelId,
            { content: channelContent },
          ))
      })
    } catch (error) {
      this.logger.error(`broadcastTweet: ${error.message}`, { tweet })
    }
  }

  private async getTrackItemsByTweet(tweet: TwitterTweet) {
    try {
      const items = await this.trackTwitterTweetService.getManyByUserId(
        tweet.authorId,
        {
          allowReply: !!tweet.inReplyToStatusId,
          allowRetweet: !!tweet.retweetedStatusId,
        },
      )
      return items
    } catch (error) {
      this.logger.error(`getTrackItemsByTweet: ${error.message}`, { tweet })
    }
    return []
  }
}
