import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { bold, inlineCode, MessageCreateOptions } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { ArrayUtil } from '../../../../util/array.util'
import { ConfigService } from '../../../config/service/config.service'
import { DiscordService } from '../../../discord/service/discord.service'
import { TrackTwitterProfileService } from '../../../track/service/track-twitter-profile.service'
import { TWITTER_API_LIST_SIZE } from '../../constant/twitter.constant'
import { TwitterUser } from '../../model/twitter-user.entity'
import { TwitterProfileUtil } from '../../util/twitter-profile.util'
import { TwitterApiService } from '../api/twitter-api.service'
import { TwitterUserControllerService } from '../controller/twitter-user-controller.service'
import { TwitterUserService } from '../data/twitter-user.service'

@Injectable()
export class TwitterProfileTrackingService {
  private readonly logger = baseLogger.child({ context: TwitterProfileTrackingService.name })

  private interval = 60000

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TrackTwitterProfileService)
    private readonly trackTwitterProfileService: TrackTwitterProfileService,
    @Inject(TwitterUserService)
    private readonly twitterUserService: TwitterUserService,
    @Inject(TwitterUserControllerService)
    private readonly twitterUserControllerService: TwitterUserControllerService,
    @Inject(TwitterApiService)
    private readonly twitterApiService: TwitterApiService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.interval = this.configService.twitter.profile.interval
  }

  public async start() {
    this.logger.info('Starting...')
    await this.execute()
  }

  private async execute() {
    try {
      const userIds = await this.trackTwitterProfileService.getUserIds()
      if (userIds.length) {
        this.logger.debug('execute', { userCount: userIds.length })
        const chunks = ArrayUtil.splitIntoChunk(userIds, TWITTER_API_LIST_SIZE)
        await Promise.allSettled(chunks.map((v) => this.checkUsers(v)))
        await this.checkUsersByGql(userIds)
      }
    } catch (error) {
      this.logger.error(`execute: ${error.message}`)
    }

    setTimeout(() => this.execute(), this.interval)
  }

  private async checkUsersByGql(ids: string[]) {
    this.logger.debug('--> checkUsersByGql', { idCount: ids.length })
    await Promise.allSettled(ids.map((id) => this.checkUserByGql(id)))
    this.logger.debug('<-- checkUsersByGql')
  }

  private async checkUserByGql(id: string) {
    try {
      const oldUser = await this.twitterUserService.getOneById(id)
      const newUser = await this.twitterUserControllerService.getUserByRestId(id)
      if (newUser) {
        await this.checkUserProfile(newUser, oldUser)
      } else {
        await this.checkInactiveUserProfile(id)
      }
    } catch (error) {
      this.logger.error(`checkUserByGql: ${error.message}`, { id })
    }
  }

  private async checkUsers(userIds: string[]) {
    try {
      const oldUsers = await this.twitterUserService.getManyByIds(userIds)
      const users = await this.twitterApiService.getUsersByUserIds(userIds)
      await this.twitterUserControllerService.saveUsersV1(users)

      const newUsers = await this.twitterUserService.getManyByIds(userIds)
      const inactiveUserIds = ArrayUtil.difference(userIds, users.map((v) => v.id_str))

      users.forEach((user) => {
        const oldUser = oldUsers.find((v) => v.id === user.id_str)
        const newUser = newUsers.find((v) => v.id === user.id_str)
        this.checkUserProfile(newUser, oldUser)
      })

      inactiveUserIds.forEach((id) => {
        this.checkInactiveUserProfile(id)
      })
    } catch (error) {
      this.logger.error(`checkUsers: ${error.message}`)
    }
  }

  private async checkInactiveUserProfile(id: string) {
    try {
      const oldUser = await this.twitterUserService.getOneById(id)
      const newUser = await this.twitterUserService.updateIsActive(id, false)
      await this.checkUserProfile(newUser, oldUser)
    } catch (error) {
      this.logger.error(`checkInactiveUserProfile: ${error.message}`, { id })
    }
  }

  private async checkUserProfile(newUser: TwitterUser, oldUser: TwitterUser) {
    if (!newUser || !oldUser) {
      return
    }

    try {
      const detectConditions = [
        newUser.isActive !== oldUser.isActive,
        newUser.username !== oldUser.username,
        newUser.name !== oldUser.name,
        newUser.protected !== oldUser.protected,
        newUser.verified !== oldUser.verified,
        newUser.location !== oldUser.location,
        newUser.description !== oldUser.description,
        newUser.profileImageUrl !== oldUser.profileImageUrl,
        newUser.profileBannerUrl !== oldUser.profileBannerUrl,
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

  private async onProfileChange(newUser: TwitterUser, oldUser: TwitterUser) {
    try {
      const trackItems = await this.getTrackItems(oldUser)
      if (!trackItems.length) {
        return
      }

      const baseContent = bold(inlineCode(`@${oldUser.username}`))
      const messageOptionsList: MessageCreateOptions[] = []

      if (newUser.isActive !== oldUser.isActive) {
        try {
          this.logger.warn(`${oldUser.username} isActive: ${TwitterProfileUtil.getBoolIcon(newUser.isActive)}`)
          messageOptionsList.push({
            content: [
              baseContent,
              `Active: ${TwitterProfileUtil.getBoolIcon(newUser.isActive)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#isActive: ${error.message}`)
        }
      }

      if (newUser.username !== oldUser.username) {
        try {
          this.logger.warn(`${oldUser.username} username`, { to: newUser.username, from: oldUser.username })
          messageOptionsList.push({
            content: [
              `${baseContent} username changed`,
              TwitterProfileUtil.getStringOldLine(oldUser.username),
              TwitterProfileUtil.getStringNewLine(newUser.username),
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#username: ${error.message}`)
        }
      }

      if (newUser.name !== oldUser.name) {
        try {
          this.logger.warn(`${oldUser.username} name`, { to: newUser.name, from: oldUser.name })
          messageOptionsList.push({
            content: [
              `${baseContent} name changed`,
              TwitterProfileUtil.getStringOldLine(oldUser.name),
              TwitterProfileUtil.getStringNewLine(newUser.name),
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#name: ${error.message}`)
        }
      }

      if (newUser.location !== oldUser.location) {
        try {
          this.logger.warn(`${oldUser.username} location`, { to: newUser.location, from: oldUser.location })
          messageOptionsList.push({
            content: [
              `${baseContent} location changed`,
              TwitterProfileUtil.getStringOldLine(oldUser.location),
              TwitterProfileUtil.getStringNewLine(newUser.location),
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#location: ${error.message}`)
        }
      }

      if (newUser.description !== oldUser.description) {
        try {
          this.logger.warn(`${oldUser.username} description`, { to: newUser.description, from: oldUser.description })
          messageOptionsList.push({
            content: [
              `${baseContent} description changed`,
              TwitterProfileUtil.getStringOldLine(oldUser.description),
              TwitterProfileUtil.getStringNewLine(newUser.description),
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#description: ${error.message}`)
        }
      }

      if (newUser.protected !== oldUser.protected) {
        try {
          this.logger.warn(`${oldUser.username} protected: ${TwitterProfileUtil.getBoolIcon(newUser.protected)}`)
          messageOptionsList.push({
            content: [
              baseContent,
              `Protected: ${TwitterProfileUtil.getBoolIcon(newUser.protected)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#protected: ${error.message}`)
        }
      }

      if (newUser.verified !== oldUser.verified) {
        try {
          this.logger.warn(`${oldUser.username} verified: ${TwitterProfileUtil.getBoolIcon(newUser.verified)}`)
          messageOptionsList.push({
            content: [
              baseContent,
              `Verified: ${TwitterProfileUtil.getBoolIcon(newUser.verified)}`,
            ].join('\n'),
          })
        } catch (error) {
          this.logger.error(`onProfileChange#verified: ${error.message}`)
        }
      }

      if (newUser.profileImageUrl !== oldUser.profileImageUrl) {
        try {
          const newProfileImageUrl = newUser.profileImageUrl
          const oldProfileImageUrl = oldUser.profileImageUrl
          this.logger.warn(`${oldUser.username} profile image`, { to: newProfileImageUrl, from: oldProfileImageUrl })
          messageOptionsList.push({
            content: [
              `${baseContent} profile image changed`,
              TwitterProfileUtil.getUrlOldLine(oldUser.profileImageUrl),
              TwitterProfileUtil.getUrlNewLine(newUser.profileImageUrl),
            ].join('\n'),
            files: [newProfileImageUrl],
          })
        } catch (error) {
          this.logger.error(`onProfileChange#profileImageUrl: ${error.message}`)
        }
      }

      if (newUser.profileBannerUrl !== oldUser.profileBannerUrl) {
        try {
          this.logger.warn(`${oldUser.username} profile banner`, { to: newUser.profileBannerUrl, from: oldUser.profileBannerUrl })
          const fileName = newUser.profileBannerUrl
            ? `${new URL(newUser.profileBannerUrl).pathname.split('/').reverse()[0]}.jpg`
            : null
          messageOptionsList.push({
            content: [
              `${baseContent} profile banner changed`,
              TwitterProfileUtil.getUrlOldLine(oldUser.profileBannerUrl),
              TwitterProfileUtil.getUrlNewLine(newUser.profileBannerUrl),
            ].join('\n'),
            files: newUser.profileBannerUrl
              ? [{ attachment: newUser.profileBannerUrl, name: fileName }]
              : null,
          })
        } catch (error) {
          this.logger.error(`onProfileChange#profileBannerUrl: ${error.message}`)
        }
      }

      trackItems.forEach((trackItem) => {
        messageOptionsList.forEach((messageOptions) => {
          const channelContent = [trackItem.discordMessage, messageOptions.content]
            .filter((v) => v)
            .join('\n')
          const channelMessageOptions = {
            ...messageOptions,
            content: channelContent,
          }
          this.discordService.sendToChannel(
            trackItem.discordChannelId,
            channelMessageOptions,
          )
        })
      })
    } catch (error) {
      this.logger.error(`onProfileChange: ${error.message}`, { newUser, oldUser })
    }
  }

  private async getTrackItems(user: TwitterUser) {
    try {
      const items = await this.trackTwitterProfileService.getManyByUserId(user.id)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { user })
    }
    return []
  }
}
