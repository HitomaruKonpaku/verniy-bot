import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import Twit from 'twit'
import winston from 'winston'
import { TWITTER_API_LIST_SIZE } from '../../constants/twitter.constant'
import { logger as baseLogger } from '../../logger'
import { TwitterUtil } from '../../utils/TwitterUtil'
import { Util } from '../../utils/Util'
import { twitterDiscordProfileController } from '../database/controllers/TwitterDiscordProfileController'
import { twitter } from './Twitter'

export class TwitterProfileWatcher extends EventEmitter {
  private logger: winston.Logger

  constructor() {
    super()
    this.logger = baseLogger.child({ label: '[TwitterProfileWatcher]' })
  }

  public async watch() {
    await this.execute()
  }

  private async execute() {
    try {
      const usernames = await twitterDiscordProfileController.getTwitterUsernames()
      if (usernames.length) {
        const usernameChunks = Util.splitArrayIntoChunk(usernames, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(usernameChunks.map((v) => this.runLookupUsers(v)))
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    const interval = TwitterUtil.getProfileRefreshInterval()
    setTimeout(() => this.execute(), interval)
  }

  private async runLookupUsers(usernames: string[]) {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> getUsersLookup', { requestId, usernameCount: usernames.length, usernames })
      const users = await twitter.fetchUsers(usernames)
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
      const oldUser = await twitter.getUser(user.id_str)
      const newUser = await twitter.updateUser(user)
      if (!oldUser || !newUser) {
        return
      }

      const detectConditions = [
        newUser.profileImageUrl !== oldUser.profileImageUrl,
        newUser.profileBannerUrl !== oldUser.profileBannerUrl,
        newUser.name !== oldUser.name,
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
