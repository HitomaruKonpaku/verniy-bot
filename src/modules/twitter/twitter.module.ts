import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { DatabaseModule } from '../database/database.module'
import { DiscordModule } from '../discord/discord.module'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule { }
