import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { MessageOptions } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackInstagramPostService } from '../../../track/services/track-instagram-post.service'
import { InstagramTrackingEvent } from '../../enum/instagram-tracking-event.enum'
import { InstagramPost } from '../../models/instagram-post.entity'
import { InstagramUser } from '../../models/instagram-user.entity'
import { InstagramUtils } from '../../utils/instagram.utils'
import { InstagramTrackingService } from './instagram-tracking.service'

@Injectable()
export class InstagramPostTrackingService {
  private readonly logger = baseLogger.child({ context: InstagramPostTrackingService.name })

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
    this.notifyUserNewPosts(user, posts)
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
            const embed = InstagramUtils.getPostEmbed(user, post)
            const options: MessageOptions = {
              content,
              embeds: [embed],
              files: [post.displayUrl].filter((v) => v),
            }
            await this.discordService.sendToChannel(trackItem.discordChannelId, options)
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
