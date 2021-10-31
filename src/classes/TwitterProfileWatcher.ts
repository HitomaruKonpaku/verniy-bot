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
    // eslint-disable-next-line max-len
    const lookupUsers = users?.filter((user) => !user.interval || user.interval >= TwitterUtil.getProfileDefaultInterval()) || []
    this.logger.info(`Lookup users ${JSON.stringify(lookupUsers)}`)
    // eslint-disable-next-line max-len
    const showUsers = users?.filter((user) => !lookupUsers.some((v) => v.username === user.username)) || []
    this.logger.info(`Show user ${JSON.stringify(showUsers)}`)

    const lookupChunks = Util.splitArrayIntoChunk(lookupUsers, TWITTER_API_LIST_SIZE)
    lookupChunks.forEach((chunk) => this.runLookupUsers(chunk))
    showUsers.forEach((user) => this.runShowUser(user))
  }

  private async runLookupUsers(users: ConfigTwitterProfileUser[]) {
    try {
      this.logger.debug(`Run lookup users ${JSON.stringify(users)}`)
      const data = await twitter.getUsersLookup(users.map((v) => v.username)) as Twit.Twitter.User[]
      data.forEach((v) => this.checkUserProfileUpdate(v))
    } catch (error) {
      this.logger.error(error.message)
    }
    setTimeout(() => this.runLookupUsers(users), TwitterUtil.getProfileDefaultInterval())
  }

  private async runShowUser(user: ConfigTwitterProfileUser) {
    try {
      this.logger.debug(`Run show user ${JSON.stringify(user)}`)
      const data = await twitter.getUsersShow(user.username) as Twit.Twitter.User
      this.checkUserProfileUpdate(data)
    } catch (error) {
      this.logger.error(error.message)
    }
    setTimeout(() => this.runShowUser(user), Number(user.interval))
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
