import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Client, MessageOptions, TextChannel } from 'discord.js'
import { EnvironmentService } from '../../environment/services/environment.service'
import { DiscordConstants } from '../constants/discord.constants'
import { DiscordEventService } from './discord-event.service'

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly _logger = new Logger(DiscordService.name)

  private _client: Client;

  public get client(): Client {
    return this._client
  }

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(forwardRef(() => DiscordEventService))
    private readonly discordEventService: DiscordEventService,
  ) { }

  public sendChannels(ids: string[], options: MessageOptions) {
    ids.forEach(async (id) => {
      await this.sendChannel(id, options)
    })
  }

  public async sendChannel(id: string, options: MessageOptions) {
    const channel = await this.client.channels.fetch(id) as TextChannel
    if (!channel) {
      this._logger.warn(`Channel ${id} not found!`)
      return
    }
    try {
      await channel.send(options)
      this._logger.log(`Message was sent to [${channel.guild.name}][${channel.name}]`)
    } catch (error) {
      this._logger.log(`Unable to send message to [${channel.guild.name}][${channel.name}]`)
      this._logger.error(error.message)
    }
  }

  async onModuleInit() {
    this.initClient()
    this.discordEventService.attachEvents()
    await this.login()
  }

  private initClient() {
    const client = new Client()
    this._client = client
  }

  private async login() {
    const token = this.environmentService.getValue(DiscordConstants.TOKEN_KEY)
    // if (this.environmentService.isDev) {
    //   this._logger.debug(`Token: ${token}`)
    // }
    try {
      await this._client.login(token)
    } catch (error) {
      this._logger.error(error.message)
    }
  }
}
