import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../logger'
import { ConfigService } from '../../config/services/config.service'
import { DiscordService } from '../../discord/services/discord.service'
import { TrackInstagramPostService } from '../../track/services/track-instagram-post.service'
import { InstagramUser } from '../models/instagram-user.entity'
import { InstagramUtils } from '../utils/instagram.utils'
import { InstagramUserControllerService } from './controller/instagram-user-controller.service'

@Injectable()
export class InstagramTrackingService {
  private readonly logger = baseLogger.child({ context: InstagramTrackingService.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackInstagramPostService)
    private readonly trackInstagramPostService: TrackInstagramPostService,
    @Inject(InstagramUserControllerService)
    private readonly instagramUserControllerService: InstagramUserControllerService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    await this.checkUsers()
  }

  private async checkUsers() {
    try {
      const usernames = await this.trackInstagramPostService.getUsernamesForCheck()
      await Promise.all(usernames.map((v) => this.checkUser(v)))
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const { interval } = this.configService.instagram.track
    setTimeout(() => this.checkUsers(), interval)
  }

  private async checkUser(username: string) {
    try {
      const user = await this.instagramUserControllerService.fetchUserByUsername(username)
      if (user?.newPosts?.length) {
        await this.notifyUserNewPosts(user)
      }
    } catch (error) {
      this.logger.error(`checkUser: ${error.message}`, { username })
    }
  }

  private async notifyUserNewPosts(user: InstagramUser) {
    try {
      const trackItems = await this.getTrackItems(user)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        user.newPosts.forEach((post) => {
          try {
            const content = [trackItem.discordMessage]
              .filter((v) => v)
              .join('\n') || null
            const embed = InstagramUtils.getPostEmbed(post, user)
            this.discordService.sendToChannel(
              trackItem.discordChannelId,
              { content, embeds: [embed] },
            )
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
