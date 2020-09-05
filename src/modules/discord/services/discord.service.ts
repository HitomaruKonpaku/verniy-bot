import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Client } from 'discord.js'
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

  async onModuleInit() {
    this.initClient()
    this.discordEventService.attachEvents()
    await this.login()
  }

  private initClient() {
    const client = new Client({})
    this._client = client
  }

  private async login() {
    const token = this.environmentService.getValue(DiscordConstants.BOT_TOKEN_KEY)
    if (this.environmentService.isDev) {
      this._logger.debug(`Token: ${token}`)
    }
    try {
      await this.client.login(token)
    } catch (error) {
      this._logger.error(error.message)
    }
  }
}
