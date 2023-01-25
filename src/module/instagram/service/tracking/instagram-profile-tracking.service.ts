import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackInstagramProfileService } from '../../../track/service/track-instagram-profile.service'
import { InstagramTrackingEvent } from '../../enum/instagram-tracking-event.enum'
import { InstagramUser } from '../../model/instagram-user.entity'
import { InstagramTrackingService } from './instagram-tracking.service'

@Injectable()
export class InstagramProfileTrackingService {
  private readonly logger = baseLogger.child({ context: InstagramProfileTrackingService.name })

  constructor(
    @Inject(InstagramTrackingService)
    private readonly instagramTrackingService: InstagramTrackingService,
    @Inject(TrackInstagramProfileService)
    private readonly trackInstagramProfileService: TrackInstagramProfileService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public start() {
    this.logger.info('Starting...')
    this.addListeners()
  }

  private addListeners() {
    this.instagramTrackingService.on(InstagramTrackingEvent.PROFILE, (newUser, oldUser) => this.checkUserProfile(newUser, oldUser))
  }

  private async checkUserProfile(newUser: InstagramUser, oldUser: InstagramUser) {
    if (!newUser || !oldUser) {
      return
    }
    try {
      const detectConditions = [
        newUser.isActive !== oldUser.isActive,
        newUser.username !== oldUser.username,
        newUser.name !== oldUser.name,
        newUser.biography !== oldUser.biography,
        newUser.isPrivate !== oldUser.isPrivate,
        newUser.isVerified !== oldUser.isVerified,
        // newUser.profileImageUrl !== oldUser.profileImageUrl,
        newUser.externalUrl !== oldUser.externalUrl,
      ]
      const isProfileChanged = detectConditions.some((v) => v)
      if (!isProfileChanged) {
        return
      }

      this.logger.info(`User changed: ${oldUser.username}`)
      this.logger.debug('New user', newUser)
      this.logger.debug('Old user', oldUser)
      this.onProfileChange(newUser, oldUser)
    } catch (error) {
      this.logger.error(`checkUserProfile: ${error.message}`, { id: oldUser.id })
    }
  }

  private async onProfileChange(newUser: InstagramUser, oldUser: InstagramUser) {
    // TODO
    debugger
  }

  private async getTrackItems(user: InstagramUser) {
    try {
      const items = await this.trackInstagramProfileService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user: { id: user.id } })
    }
    return []
  }
}
