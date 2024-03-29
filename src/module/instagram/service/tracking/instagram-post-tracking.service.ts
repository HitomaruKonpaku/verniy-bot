import { forwardRef, Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { MessageCreateOptions } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackInstagramPostService } from '../../../track/service/track-instagram-post.service'
import { InstagramTrackingEvent } from '../../enum/instagram-tracking-event.enum'
import { InstagramPost } from '../../model/instagram-post.entity'
import { InstagramUser } from '../../model/instagram-user.entity'
import { InstagramUtil } from '../../util/instagram.util'
import { InstagramTrackingService } from './instagram-tracking.service'

@Injectable()
export class InstagramPostTrackingService {
  private readonly logger = baseLogger.child({ context: InstagramPostTrackingService.name })

  private readonly notificationLimiterGroup = new Bottleneck.Group({ maxConcurrent: 1 });

  constructor(
    @Inject(InstagramTrackingService)
    private readonly instagramTrackingService: InstagramTrackingService,
    @Inject(TrackInstagramPostService)
    private readonly trackInstagramPostService: TrackInstagramPostService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.addListeners()
  }

  private addListeners() {
    this.instagramTrackingService.on(InstagramTrackingEvent.POST, (user, posts) => this.onNewPosts(user, posts))
  }

  private onNewPosts(user: InstagramUser, posts: InstagramPost[]) {
    if (!user || !posts?.length) {
      return
    }
    this.notifyUserNewPosts(user, posts.sort((a, b) => a.createdAt - b.createdAt))
  }

  private async notifyUserNewPosts(user: InstagramUser, posts: InstagramPost[]) {
    try {
      const trackItems = await this.getTrackItems(user)
      if (!trackItems.length) {
        return
      }

      trackItems.forEach((trackItem) => {
        posts.forEach(async (post) => {
          try {
            const content = [trackItem.discordMessage]
              .filter((v) => v)
              .join('\n') || null
            const embed = InstagramUtil.getPostEmbed(user, post)
            const options: MessageCreateOptions = {
              content,
              embeds: [embed],
              files: [post.displayUrl].filter((v) => v),
            }

            await this.notificationLimiterGroup
              .key(trackItem.discordChannelId)
              .schedule(async () => {
                // Send base message with image
                await this.discordService.sendToChannel(trackItem.discordChannelId, options)

                // Send video (optional)
                if (post.isVideo && post.videoUrl) {
                  await this.discordService
                    .sendToChannel(trackItem.discordChannelId, { files: [post.videoUrl] })
                    .catch((error) => this.logger.error(`notifyUserNewPosts#sendVideo: ${error.message}`))
                }
              })
          } catch (error) {
            this.logger.error(`notifyUserNewPosts#send: ${error.message}`, {
              user: { id: user.id, username: user.username },
              post: { id: post.id },
            })
          }
        })
      })
    } catch (error) {
      this.logger.error(`notifyUserNewPosts: ${error.message}`, { user })
    }
  }

  private async getTrackItems(user: InstagramUser) {
    try {
      const items = await this.trackInstagramPostService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user: { id: user.id } })
    }
    return []
  }
}
