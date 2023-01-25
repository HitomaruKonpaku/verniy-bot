import { Inject, Injectable } from '@nestjs/common'
import { DiscordService } from './module/discord/service/discord.service'

@Injectable()
export class AppService {
  constructor(
    @Inject(DiscordService)
    private readonly discordService: DiscordService,
  ) { }

  public async start() {
    await this.discordService.start()
  }
}
