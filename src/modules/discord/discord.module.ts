import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { DatabaseModule } from '../database/database.module'
import { TwitterModule } from '../twitter/twitter.module'
import { GetCommand } from './commands/get.command'
import { TrackCommand } from './commands/track.command'
import { UntrackCommand } from './commands/untrack.command'
import { DiscordService } from './services/discord.service'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => TwitterModule),
  ],
  providers: [
    DiscordService,
    TrackCommand,
    UntrackCommand,
    GetCommand,
  ],
  exports: [DiscordService],
})
export class DiscordModule { }
