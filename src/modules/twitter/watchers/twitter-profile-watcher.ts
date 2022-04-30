import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import Twit from 'twit'
import { logger as baseLogger } from '../../../logger'
import { Utils } from '../../../utils/Utils'
import { ConfigService } from '../../config/services/config.service'
import { TwitterDiscordProfileService } from '../../database/services/twitter-discord-profile.service'
import { TwitterUserService } from '../../database/services/twitter-user.service'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { TwitterService } from '../services/twitter.service'

export class TwitterProfileWatcher extends EventEmitter {
  private readonly logger = baseLogger.child({ context: TwitterProfileWatcher.name })

  constructor(
    private readonly configService: ConfigService,
    private readonly twitterService: TwitterService,
    private readonly twitterUserService: TwitterUserService,
    private readonly twitterDiscordProfileService: TwitterDiscordProfileService,
  ) {
    super()
  }

  public async start() {
    const usernames = await this.twitterDiscordProfileService.getTwitterUsernames()
    this.logger.info('Starting...')
    this.logger.info('Users', {
      count: usernames.length,
      usernames,
    })
    await this.execute()
  }

  private async execute() {
    try {
      const usernames = await this.twitterDiscordProfileService.getTwitterUsernames()
      if (usernames.length) {
        const usernameChunks = Utils.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(usernameChunks.map((v) => this.runLookupUsers(v)))
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const interval = this.configService.twitterProfileInterval
    setTimeout(() => this.execute(), interval)
  }

  private async runLookupUsers(usernames: string[]) {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getUsersLookup', { requestId, usernameCount: usernames.length, usernames })
      const users = await this.twitterService.fetchUsers(usernames)
      this.logger.debug('<-- getUsersLookup', { requestId })
      users.forEach((v) => this.checkUserProfileUpdate(v))
    } catch (error) {
      this.logger.error(`runLookupUsers: ${error.message}`)
    }
  }

  private async checkUserProfileUpdate(user: Twit.Twitter.User) {
    if (!user) {
      return
    }

    try {
      const oldUser = await this.twitterUserService.getOneById(user.id_str)
      const newUser = await this.twitterUserService.updateByTwitterUser(user)
      if (!oldUser || !newUser) {
        return
      }

      const detectConditions = [
        newUser.name !== oldUser.name,
        newUser.location !== oldUser.location,
        newUser.description !== oldUser.description,
        newUser.protected !== oldUser.protected,
        newUser.verified !== oldUser.verified,
        newUser.profileImageUrl !== oldUser.profileImageUrl,
        newUser.profileBannerUrl !== oldUser.profileBannerUrl,
      ]
      const isProfileChanged = detectConditions.some((v) => v)
      if (!isProfileChanged) {
        return
      }

      this.logger.info(`User update: ${user.screen_name}`)
      this.logger.debug('New user', newUser)
      this.logger.debug('Old user', oldUser)
      this.emit('profileUpdate', newUser, oldUser)
    } catch (error) {
      this.logger.error(`checkUserProfileUpdate: ${error.message}`, { user })
    }
  }
}
