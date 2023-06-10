import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { EnvironmentModule } from '../environment/environment.module'
import { HolodexModule } from '../holodex/holodex.module'
import { InstagramModule } from '../instagram/instagram.module'
import { TiktokModule } from '../tiktok/tiktok.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingModule } from '../twitcasting/twitcasting.module'
import { TwitchModule } from '../twitch/twitch.module'
import { TwitterModule } from '../twitter/twitter.module'
import { YoutubeModule } from '../youtube/youtube.module'
import { DISCORD_ALL_COMMANDS } from './constant/discord-command.constant'
import { DiscordActivityCronService } from './cron/discord-activity-cron.service'
import { DiscordCronService } from './cron/discord-cron.service'
import { DiscordGuildCronService } from './cron/discord-guild-cron.service'
import { DiscordUserCronService } from './cron/discord-user-cron.service'
import { DiscordChannel } from './model/discord-channel.entity'
import { DiscordGuild } from './model/discord-guild.entity'
import { DiscordMessage } from './model/discord-message.entity'
import { DiscordUser } from './model/discord-user.entity'
import { DiscordChannelService } from './service/data/discord-channel.service'
import { DiscordGuildService } from './service/data/discord-guild.service'
import { DiscordMessageService } from './service/data/discord-message.service'
import { DiscordUserService } from './service/data/discord-user.service'
import { DiscordClientService } from './service/discord-client.service'
import { DiscordDbService } from './service/discord-db.service'
import { DiscordService } from './service/discord.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscordUser,
      DiscordGuild,
      DiscordChannel,
      DiscordMessage,
    ]),
    EnvironmentModule,
    ConfigModule,
    TrackModule,
    forwardRef(() => TwitterModule),
    forwardRef(() => TwitCastingModule),
    forwardRef(() => YoutubeModule),
    forwardRef(() => TwitchModule),
    forwardRef(() => InstagramModule),
    forwardRef(() => TiktokModule),
    forwardRef(() => HolodexModule),
  ],
  providers: [
    DiscordService,
    DiscordClientService,

    DiscordDbService,
    DiscordUserService,
    DiscordGuildService,
    DiscordChannelService,
    DiscordMessageService,

    DiscordCronService,
    DiscordActivityCronService,
    DiscordUserCronService,
    DiscordGuildCronService,

    ...DISCORD_ALL_COMMANDS,
  ],
  exports: [
    DiscordService,
  ],
})
export class DiscordModule { }
