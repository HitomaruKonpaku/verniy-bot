import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { Client, Message, TextChannel } from 'discord.js'
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
  ) { }

  public attachEvents() {
    this.client
      .on('debug', info => this.onDebug(info))
      .on('warn', info => this.onWarn(info))
      .on('error', error => this.onError(error))
      .on('ready', () => this.onReady())
      .once('ready', () => this.onceReady())
      .on('message', message => this.onMessage(message))
  }

  private onDebug(info: string) {
    this._logger.log(info)
  }

  private onWarn(info: string) {
    this._logger.log(info)
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
}
