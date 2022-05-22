import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingModule } from '../twitcasting/twitcasting.module'
import { TwitterModule } from '../twitter/twitter.module'
import { GetCommand } from './commands/get.command'
import { TrackCommand } from './commands/track.command'
import { UntrackCommand } from './commands/untrack.command'
import { DiscordChannel } from './models/discord-channel.entity'
import { DiscordGuild } from './models/discord-guild.entity'
import { DiscordMessage } from './models/discord-message.entity'
import { DiscordUser } from './models/discord-user.entity'
import { DiscordChannelService } from './services/discord-channel.service'
import { DiscordGuildService } from './services/discord-guild.service'
import { DiscordUserService } from './services/discord-user.service'
import { DiscordService } from './services/discord.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscordUser,
      DiscordGuild,
      DiscordChannel,
      DiscordMessage,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => TwitterModule),
    forwardRef(() => TwitCastingModule),
  ],
  providers: [
    DiscordService,
    DiscordUserService,
    DiscordGuildService,
    DiscordChannelService,
    TrackCommand,
    UntrackCommand,
    GetCommand,
  ],
  exports: [
    DiscordService,
  ],
})
export class DiscordModule { }
