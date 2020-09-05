import { forwardRef, Module } from '@nestjs/common'
import { DiscordModule } from '../discord/discord.module'
import { EnvironmentModule } from '../environment/environment.module'
import { TwitterEventService } from './services/twitter-event.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    EnvironmentModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitterService,
    TwitterEventService,
  ],
  exports: [TwitterService],
})
export class TwitterModule { }
