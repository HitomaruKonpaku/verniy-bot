import EventEmitter from 'events'
import Twit from 'twit'
import winston from 'winston'
import { twitter } from '../clients/twitter'
import { TWITTER_API_LIST_SIZE } from '../constants/twitter.constant'
import { ConfigTwitterProfileUser } from '../interfaces/ConfigTwitterProfileUser'
import { logger as baseLogger } from '../logger'
import { TwitterUtil } from '../utils/TwitterUtil'
import { Util } from '../utils/Util'

export class TwitterProfileWatcher extends EventEmitter {
  private logger: winston.Logger

  constructor() {
    super()
    this.logger = baseLogger.child({ label: '[TwitterProfileWatcher]' })
  }

  public watch(users: ConfigTwitterProfileUser[]) {
    const defaultRefreshInterval = TwitterUtil.getProfileDefaultInterval()
    // eslint-disable-next-line max-len
    const lookupUsers = users?.filter((user) => !user.interval || user.interval >= defaultRefreshInterval) || []
    this.logger.info(`Lookup ${lookupUsers.length} users ${lookupUsers.map((v) => v.username).join(', ')}`)
    // eslint-disable-next-line max-len
    const showUsers = users?.filter((user) => !lookupUsers.some((v) => v.username === user.username)) || []
    this.logger.info(`Show ${showUsers.length} users ${showUsers.map((v) => `${v.username} @ ${v.interval}`).join(', ')}`)

    const lookupChunks = Util.splitArrayIntoChunk(lookupUsers, TWITTER_API_LIST_SIZE)
    lookupChunks.forEach((chunk) => this.runLookupUsers(chunk))
    showUsers.forEach((user) => this.runShowUser(user))
  }

  private async runLookupUsers(users: ConfigTwitterProfileUser[]) {
    const interval = TwitterUtil.getProfileDefaultInterval()
    try {
      this.logger.debug('Run lookup users', { length: users.length, users: users.map((v) => v.username) })
      const data = await twitter.getUsersLookup(users.map((v) => v.username)) as Twit.Twitter.User[]
      data.forEach((v) => this.checkUserProfileUpdate(v))
    } catch (error) {
      this.logger.error(error.message)
    }
    this.logger.debug(`New lookup users in ${interval}ms`)
    setTimeout(() => this.runLookupUsers(users), interval)
  }

  private async runShowUser(user: ConfigTwitterProfileUser) {
    const interval = Number(user.interval)
    try {
      this.logger.debug('Run show user', { user: user.username })
      const data = await twitter.getUsersShow(user.username) as Twit.Twitter.User
      this.checkUserProfileUpdate(data)
    } catch (error) {
      this.logger.error(error.message)
    }
    this.logger.debug(`New show user ${user.username} in ${interval}ms`)
    setTimeout(() => this.runShowUser(user), interval)
  }

  private checkUserProfileUpdate(newUser: Twit.Twitter.User) {
    if (!newUser?.id_str) {
      return
    }
    const oldUser = twitter.getUser(newUser.id_str)
    if (!oldUser) {
      twitter.addUser(newUser)
      return
    }
    twitter.updateUser(newUser)
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
