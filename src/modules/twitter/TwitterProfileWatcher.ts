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

  public watch() {
    this.execute()
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

  private checkUserProfileUpdate(newUser: Twit.Twitter.User) {
    if (!newUser?.id_str) {
      return
    }

    const oldUser = twitter.getUser(newUser.id_str)
    twitter.updateUser(newUser)
    if (!oldUser) {
      return
    }

    const detectConditions = [
      newUser.profile_image_url_https !== oldUser.profile_image_url_https,
      newUser.profile_banner_url !== oldUser.profile_banner_url,
    ]
    const isProfileUpdate = detectConditions.some((v) => v)
    if (!isProfileUpdate) {
      return
    }

    this.logger.info(`User update: ${newUser.screen_name}`)
    this.logger.debug('New user', newUser)
    this.logger.debug('Old user', oldUser)
    this.emit('profileUpdate', newUser, oldUser)
  }
}
