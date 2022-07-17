import { bold, inlineCode } from '@discordjs/builders'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ChatUserstate, Client } from 'tmi.js'
import { baseLogger } from '../../../../logger'
import { DiscordService } from '../../../discord/services/discord.service'
import { TrackTwitchChatService } from '../../../track/services/track-twitch-chat.service'

@Injectable()
export class TwitchChatTrackingService {
  private readonly logger = baseLogger.child({ context: TwitchChatTrackingService.name })

  private readonly DEBUG = false

  private client: Client

  constructor(
    @Inject(TrackTwitchChatService)
    private readonly trackTwitchChatService: TrackTwitchChatService,
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

  private initClient() {
    const client = new Client({
      options: { debug: this.DEBUG },
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
    //
    client.on('connected', () => this.joinDefaultChannels())
    // message
    client.on('message', (channel, userstate, message, self) => this.onMessage(channel, userstate, message, self))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onMessage(channel: string, userstate: ChatUserstate, message: string, self: boolean) {
    const username = userstate?.username?.toLowerCase?.()
    const isBroadcaster = username === channel.substring(1).toLowerCase()
    if (!isBroadcaster) {
      return
    }
    this.notifyMessage(channel, userstate, message)
  }

  private async notifyMessage(channel: string, userstate: ChatUserstate, message: string) {
    const userId = userstate?.['user-id']
    if (!userId) {
      return
    }
    try {
      this.logger.warn(
        `notifyMessage: ${userstate.username}`,
        { channel, username: userstate.username, msg: message },
      )
      const trackItems = await this.getTrackItems(userId)
      if (!trackItems.length) {
        return
      }
      trackItems.forEach((trackItem) => {
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

  private async getTrackItems(userId: string) {
    try {
      const items = await this.trackTwitchChatService.getManyByUserId(userId)
      return items
    } catch (error) {
      this.logger.error(`getTrackItems: ${error.message}`, { userId })
    }
    return []
  }
}
