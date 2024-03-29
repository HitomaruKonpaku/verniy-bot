import { forwardRef, Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { MessageCreateOptions } from 'discord.js'
import { ETwitterStreamEvent, TweetV2SingleStreamResult } from 'twitter-api-v2'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/service/config.service'
import { DiscordService } from '../../discord/service/discord.service'
import { TrackTiktokVideoService } from '../../track/service/track-tiktok-video.service'
import { TwitterTweetTrackingService } from '../../twitter/service/tracking/twitter-tweet-tracking.service'
import { TwitterUtil } from '../../twitter/util/twitter.util'
import { TiktokUser } from '../model/tiktok-user.entity'
import { TiktokUtil } from '../util/tiktok.util'
import { TiktokProxyService } from './api/tiktok-proxy.service'
import { TiktokUserControllerService } from './controller/tiktok-user-controller.service'

@Injectable()
export class TiktokTrackingService {
  private readonly logger = baseLogger.child({ context: TiktokTrackingService.name })

  private readonly notificationLimiterGroup = new Bottleneck.Group({ maxConcurrent: 1 });

  private errorUserCount = 0

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTiktokVideoService)
    private readonly trackTiktokVideoService: TrackTiktokVideoService,
    @Inject(TiktokUserControllerService)
    private readonly tiktokUserControllerService: TiktokUserControllerService,
    @Inject(TiktokProxyService)
    private readonly tiktokProxyService: TiktokProxyService,
    @Inject(TwitterTweetTrackingService)
    private readonly twitterTweetTrackingService: TwitterTweetTrackingService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.addListeners()
    await this.checkUsers()
  }

  private addListeners() {
    if (this.configService.twitter.tweet) {
      this.logger.info('Listen to tweets')
      this.twitterTweetTrackingService.on(ETwitterStreamEvent.Data, (data) => this.onTweetData(data))
    }
  }

  private async checkUsers() {
    try {
      this.errorUserCount = 0
      const usernames = await this.trackTiktokVideoService.getUsernamesForCheck()
      this.logger.debug('checkUsers', { userCount: usernames.length })
      if (usernames.length) {
        await Promise.all(usernames.map((v) => this.checkUser(v)))
        // Switch proxy if error count exceed 75%
        if (this.errorUserCount / usernames.length > 0.75) {
          this.tiktokProxyService.switchProxy()
        }
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const { interval } = this.configService.tiktok.track
    setTimeout(() => this.checkUsers(), interval)
  }

  private async checkUser(username: string) {
    try {
      const user = await this.tiktokUserControllerService.fetchUser(username)
      if (!user) {
        this.errorUserCount += 1
      }
      if (user?.newVideos?.length) {
        await this.notifyUserNewVideos(user)
      }
    } catch (error) {
      this.logger.error(`checkUser: ${error.message}`, { username })
    }
  }

  private async onTweetData(data: TweetV2SingleStreamResult) {
    const urls = TwitterUtil.getTweetV2EntityUrls(data)
    if (!urls.length) {
      return
    }

    const patterns = ['tiktok.com']
    const filterUrls = urls.filter((url) => patterns.some((v) => url.includes(v)))
    if (!filterUrls.length) {
      return
    }

    // TODO: Check and forward urls to channels ?
    filterUrls.forEach((url) => this.logger.warn(`onTweetData: ${url}`))
  }

  private async notifyUserNewVideos(user: TiktokUser) {
    try {
      const trackItems = await this.getTrackItems(user)
      if (!trackItems.length) {
        return
      }

      trackItems.forEach((trackItem) => {
        user.newVideos.forEach(async (video) => {
          try {
            const content = [trackItem.discordMessage]
              .filter((v) => v)
              .join('\n') || null
            const embed = TiktokUtil.getVideoEmbed(video, user, this.tiktokProxyService.getProxyUrl())
            const options: MessageCreateOptions = {
              content,
              embeds: [embed],
            }

            await this.notificationLimiterGroup
              .key(trackItem.discordChannelId)
              .schedule(async () => {
                // Send base message
                await this.discordService.sendToChannel(trackItem.discordChannelId, options)

                // Send video
                if (video.src) {
                  await this.discordService
                    .sendToChannel(
                      trackItem.discordChannelId,
                      { files: [{ attachment: video.src, name: `${video.id}.mp4` }] },
                      { throwError: true },
                    )
                    .catch((error) => this.discordService.sendToChannel(trackItem.discordChannelId, `Unable to send video: ${error.message}`))
                }
              })
          } catch (error) {
            this.logger.error(`notifyUserNewVideos#send: ${error.message}`, {
              user: { id: user.id, username: user.username },
              video: { id: video.id },
            })
          }
        })
      })
    } catch (error) {
      this.logger.error(`notifyUserNewVideos: ${error.message}`, { user })
    }
  }

  private async getTrackItems(user: TiktokUser) {
    try {
      const items = await this.trackTiktokVideoService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user: { id: user.id } })
    }
    return []
  }
}
