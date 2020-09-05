import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Client, Guild, Message, TextChannel } from 'discord.js'
import { TwitterService } from '../../twitter/services/twitter.service'
import { DiscordService } from './discord.service'

@Injectable()
export class DiscordEventService {
  private readonly _logger = new Logger(DiscordEventService.name)

  private get client(): Client {
    return this.discordService.client
  }

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    private readonly twitterService: TwitterService,
  ) { }

  public attachEvents() {
    this.client
      .on('debug', info => this.onDebug(info))
      .on('warn', info => this.onWarn(info))
      .on('error', error => this.onError(error))
      .on('ready', () => this.onReady())
      .once('ready', () => this.onceReady())
      .on('message', message => this.onMessage(message))
      .on('guildUnavailable', guild => this.onGuildUnavailable(guild))
      .on('guildCreate', guild => this.onGuildCreate(guild))
      .on('guildDelete', guild => this.onGuildDelete(guild))
  }

  private onDebug(info: string) {
    const skipMessages = [
      'Authenticated using token',
      'Sending a heartbeat',
      'Heartbeat acknowledged',
      'READY'
    ]
    if (skipMessages.some(v => info.includes(v))) {
      return
    }
    this._logger.debug(info)
  }

  private onWarn(info: string) {
    this._logger.warn(info)
  }

  private onError(error: Error) {
    this._logger.error(error.message)
  }

  private onReady() {
    const msg = `${this.client.user.tag} ready!`
    this._logger.log(msg)
  }

  private onceReady() {
    // TODO
    this.twitterService.start()
  }

  private onMessage(message: Message) {
    const guild = message.guild
    const channel = message.channel as TextChannel
    const author = message.author
    const content = message.cleanContent

    const ignoreAuthorIds = ['742677218471313488']
    if (author.bot || ignoreAuthorIds.some(id => id === author.id)) {
      return
    }

    const msg = [
      [
        guild.name,
        channel.name,
        author.tag,

      ].map(v => `[${v}]`).join(''),
      ` > ${content}`,
    ].join('')
    this._logger.log(msg)
  }

  private onGuildUnavailable(guild: Guild) {
    const msg = `[Guild] Unavailable: ${guild.name}`
    this._logger.warn(msg)
  }

  private onGuildCreate(guild: Guild) {
    const msg = `[Guild] Joined: ${guild.name}`
    this._logger.log(msg)
  }

  private onGuildDelete(guild: Guild) {
    const msg = `[Guild] Leave: ${guild.name}`
    this._logger.log(msg)
  }
}
