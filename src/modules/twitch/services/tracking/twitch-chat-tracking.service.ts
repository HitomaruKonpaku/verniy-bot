import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { bold, inlineCode } from 'discord.js'
import { ChatUserstate, Client } from 'tmi.js'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackTwitchChat } from '../../../track/models/track-twitch-chat.entity'
import { TrackTwitchChatService } from '../../../track/services/track-twitch-chat.service'
import { TwitchUserService } from '../data/twitch-user.service'

@Injectable()
export class TwitchChatTrackingService {
  private readonly logger = baseLogger.child({ context: TwitchChatTrackingService.name })

  private readonly debug = false
  private readonly filterUserIds = new Set<string>()

  private client: Client

  constructor(
    @Inject(TrackTwitchChatService)
    private readonly trackTwitchChatService: TrackTwitchChatService,
    @Inject(TwitchUserService)
    private readonly twitchUserService: TwitchUserService,
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    this.logger.info('Starting...')
    this.initClient()
    await this.connect()
  }

  public async joinChannel(channel: string) {
    this.logger.debug('joinChannel', { channel })
    try {
      return this.client.join(channel)
    } catch (error) {
      this.logger.error(`join: ${error.message}`, { channel })
    }
    return null
  }

  public addFilterUserId(id: string) {
    if (!id) {
      return
    }
    this.logger.debug('addFilterUserId', { id })
    this.filterUserIds.add(id)
  }

  private async connect(retryCount = 0) {
    try {
      await this.client.connect()
    } catch (error) {
      this.logger.error(`connect: ${error.message}`)
      const retryMs = ([2, 4, 8, 16][retryCount] || 32) * 1000
      this.logger.info(`connect: Retry in ${retryMs}ms`)
      setTimeout(() => this.connect(retryCount + 1), retryMs)
    }
  }

  private async joinDefaultChannels() {
    this.logger.warn('joinDefaultChannels')
    try {
      const usernames = await this.trackTwitchChatService.getUsernamesForChatCheck()
      if (usernames.length) {
        this.logger.debug('joinDefaultChannels', { userCount: usernames.length })
        await Promise.allSettled(usernames.map((v) => this.joinChannel(v)))
      }
    } catch (error) {
      this.logger.error(`joinDefaultChannels: ${error.message}`)
    }
  }

  private async initFilterUserIds() {
    this.logger.warn('initFilterUserIds')
    try {
      const userIds = await this.trackTwitchChatService.getFilterUserIdsForChatFilter()
      if (userIds.length) {
        this.logger.debug('initFilterUserIds', { userCount: userIds.length })
        userIds.forEach((v) => this.addFilterUserId(v))
      }
    } catch (error) {
      this.logger.error(`initFilterUserIds: ${error.message}`)
    }
  }

  private initClient() {
    const client = new Client({
      options: { debug: this.debug },
    })
    this.client = client
    this.addClientEventListeners()
  }

  private addClientEventListeners() {
    const { client } = this
    // ping pong
    client.on('ping', () => this.logger.debug('[WS] ping'))
    client.on('pong', () => this.logger.debug('[WS] pong'))
    // connection
    client.on('connecting', () => this.logger.debug('[WS] connecting'))
    client.on('logon', () => this.logger.debug('[WS] logon'))
    client.on('connected', () => this.logger.debug('[WS] connected'))
    client.on('disconnected', () => this.logger.debug('[WS] disconnected'))
    client.on('reconnect', () => this.logger.debug('[WS] reconnect'))
    // connected
    client.on('connected', () => this.joinDefaultChannels())
    client.on('connected', () => this.initFilterUserIds())
    // message
    client.on('message', (channel, userstate, message, self) => this.onMessage(channel, userstate, message, self))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async onMessage(channel: string, userstate: ChatUserstate, message: string, self: boolean) {
    const userId = userstate?.['user-id']
    if (!userId) {
      return
    }

    const hostUsername = channel.substring(1).toLowerCase()
    const isHost = userstate?.username?.toLowerCase?.() === hostUsername
    if (isHost) {
      const trackItems = await this.getTrackItems(userId)
      this.notifyMessage(trackItems, channel, userstate, message)
      return
    }

    const isFilterUser = this.filterUserIds.has(userId)
    if (!isFilterUser) {
      return
    }

    const host = await this.twitchUserService.getOneByUsername(hostUsername)
    if (!host) {
      return
    }

    const trackItems = await this.getTrackItems(host.id, userId)
    this.notifyMessage(trackItems, channel, userstate, message)
  }

  private async notifyMessage(trackItems: TrackTwitchChat[], channel: string, userstate: ChatUserstate, message: string) {
    if (!trackItems?.length) {
      return
    }

    try {
      this.logger.info(
        `notifyMessage: ${userstate.username}`,
        { channel, username: userstate.username, msg: message },
      )

      trackItems.forEach((trackItem) => {
        if (trackItem.filterKeywords?.length && !trackItem.filterKeywords.some((v) => message.toLowerCase().includes(v.toLowerCase()))) {
          return
        }

        const msgContent = `💬 ${bold(inlineCode(userstate['display-name']))} 📄 ${inlineCode(message)}`
        const content = [trackItem.discordMessage, msgContent]
          .filter((v) => v)
          .join('\n') || null

        this.discordService.sendToChannel(
          trackItem.discordChannelId,
          { content },
        )
      })
    } catch (error) {
      this.logger.error(`notifyMessage: ${error.message}`, { channel, userstate, msg: message })
    }
  }

  private async getTrackItems(userId: string, filterUserId = '') {
    try {
      const items = await this.trackTwitchChatService.getManyByUserId(userId, { filterUserId })
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { userId, filterUserId })
    }
    return []
  }
}
