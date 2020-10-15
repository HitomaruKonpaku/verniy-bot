import { Module } from '@nestjs/common'
import { EnvironmentModule } from '../environment/environment.module'
import { TwitterModule } from '../twitter/twitter.module'
import { DiscordEventService } from './services/discord-event.service'
import { DiscordService } from './services/discord.service'

@Module({
  imports: [
    EnvironmentModule,
    TwitterModule,
  ],
  providers: [
    DiscordService,
    DiscordEventService,
  ],
  exports: [DiscordService],
})
export class DiscordModule { }
