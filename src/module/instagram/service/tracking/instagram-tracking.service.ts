import { Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import { EventEmitter } from 'stream'
import { CRON_TIME_ZONE } from '../../../../constant/cron.constant'
import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/service/config.service'
import { InstagramTrackingEvent } from '../../enum/instagram-tracking-event.enum'
import { instagramTrackingQueueLimiter } from '../../instagram.limiter'
import { InstagramUser } from '../../model/instagram-user.entity'
import { InstagramStoryControllerService } from '../controller/instagram-story-controller.service'
import { InstagramUserControllerService } from '../controller/instagram-user-controller.service'
import { InstagramUserService } from '../data/instagram-user.service'

@Injectable()
export class InstagramTrackingService extends EventEmitter {
  private readonly logger = baseLogger.child({ context: InstagramTrackingService.name })

  private shouldCheckUserProfileAndPosts = true
  private shouldCheckUserStories = true

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(InstagramUserService)
    private readonly instagramUserService: InstagramUserService,
    @Inject(InstagramUserControllerService)
    private readonly instagramUserControllerService: InstagramUserControllerService,
    @Inject(InstagramStoryControllerService)
    private readonly instagramStoryControllerService: InstagramStoryControllerService,
  ) {
    super()

    const cronTime = '0 0 */3 * * *'
    const cronJob = new CronJob(
      cronTime,
      () => {
        this.shouldCheckUserProfileAndPosts = true
      },
      null,
      false,
      CRON_TIME_ZONE,
    )
    cronJob.start()
  }

  public start() {
    this.logger.info('Starting...')
    this.checkUsers()
  }

  private async checkUsers() {
    try {
      const limiter = instagramTrackingQueueLimiter
      const users = await this.instagramUserService.getManyForTracking()
      this.logger.debug('checkUsers', { userCount: users.length })

      await Promise.all(users.reduce((pv, user) => {
        if (this.shouldCheckUserProfileAndPosts) {
          // pv.push(limiter.schedule(() => this.checkUserProfileAndPosts(user)))
        }
        if (this.shouldCheckUserStories) {
          pv.push(limiter.schedule(() => this.checkUserStories(user)))
        }
        return pv
      }, [] as any[]))
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }

    this.shouldCheckUserProfileAndPosts = false

    const { interval } = this.configService.instagram.track
    setTimeout(() => this.checkUsers(), interval)
  }

  private async checkUserProfileAndPosts(user: InstagramUser) {
    try {
      const newUser = await this.instagramUserControllerService.fetchUserByUsername(user.username)
      if (!newUser) {
        return
      }
      if (newUser.newPosts?.length) {
        this.emit(InstagramTrackingEvent.POST, newUser, newUser.newPosts)
      }
      const newUserWithoutPosts = { ...newUser }
      delete newUserWithoutPosts.posts
      delete newUserWithoutPosts.newPosts
      this.emit(InstagramTrackingEvent.PROFILE, newUserWithoutPosts, user)
    } catch (error) {
      this.logger.error(
        `checkUserProfileAndPosts: ${error.message}`,
        { user: { id: user.id, username: user.username } },
      )
    }
  }

  private async checkUserStories(user: InstagramUser) {
    try {
      const stories = await this.instagramStoryControllerService.getNewUserStories(user.id, user.username)
      if (stories?.length) {
        this.emit(InstagramTrackingEvent.STORY, user, stories)
      }
    } catch (error) {
      this.logger.error(
        `checkUserStories: ${error.message}`,
        { user: { id: user.id, username: user.username } },
      )
    }
  }
}
