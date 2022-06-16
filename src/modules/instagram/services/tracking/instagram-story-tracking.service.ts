import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackInstagramStoryService } from '../../../track/services/track-instagram-story.service'
import { InstagramTrackingEvent } from '../../enum/instagram-tracking-event.enum'
import { InstagramStory } from '../../models/instagram-story.entity'
import { InstagramUser } from '../../models/instagram-user.entity'
import { InstagramUtils } from '../../utils/instagram.utils'
import { InstagramTrackingService } from './instagram-tracking.service'

@Injectable()
export class InstagramStoryTrackingService {
  private readonly logger = baseLogger.child({ context: InstagramStoryTrackingService.name })

  constructor(
    @Inject(InstagramTrackingService)
    private readonly instagramTrackingService: InstagramTrackingService,
    @Inject(TrackInstagramStoryService)
    private readonly trackInstagramStoryService: TrackInstagramStoryService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.addListeners()
  }

  private addListeners() {
    this.instagramTrackingService.on(InstagramTrackingEvent.STORY, (user, stories) => this.onNewStories(user, stories))
  }

  private onNewStories(user: InstagramUser, stories: InstagramStory[]) {
    if (!user || !stories?.length) {
      return
    }
    this.notifyUserNewStories(user, stories)
  }

  private async notifyUserNewStories(user: InstagramUser, stories: InstagramStory[]) {
    try {
      const trackItems = await this.getTrackItems(user)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
        stories.forEach((story) => {
          try {
            const content = [trackItem.discordMessage]
              .filter((v) => v)
              .join('\n') || null
            const embed = InstagramUtils.getStoryEmbed(user, story)
            this.discordService.sendToChannel(
              trackItem.discordChannelId,
              { content, embeds: [embed] },
            )
          } catch (error) {
            this.logger.error(`notifyUserNewStories#send: ${error.message}`, {
              user: { id: user.id, username: user.username },
              post: { id: story.id },
            })
          }
        })
      })
    } catch (error) {
      this.logger.error(`notifyUserNewStories: ${error.message}`, { user })
    }
  }

  private async getTrackItems(user: InstagramUser) {
    try {
      const items = await this.trackInstagramStoryService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user: { id: user.id } })
    }
    return []
  }
}
