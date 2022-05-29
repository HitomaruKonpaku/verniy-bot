import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingModule } from '../twitcasting/twitcasting.module'
import { TwitchModule } from '../twitch/twitch.module'
import { TwitterModule } from '../twitter/twitter.module'
import { GetCommand } from './commands/get/get.command'
import { TrackAddTwitCastingLiveCommand } from './commands/track/track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchUserStreamCommand } from './commands/track/track-add/track-add-twitch-user-stream.command'
import { TrackAddTwitterProfileCommand } from './commands/track/track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from './commands/track/track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from './commands/track/track-add/track-add-twitter-tweet.command'
import { TrackAddCommand } from './commands/track/track-add/track-add.command'
import { TrackRemoveTwitCastingLiveCommand } from './commands/track/track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchUserStreamCommand } from './commands/track/track-remove/track-remove-twitch-user-stream.command'
import { TrackRemoveTwitterProfileCommand } from './commands/track/track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from './commands/track/track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from './commands/track/track-remove/track-remove-twitter-tweet.command'
import { TrackRemoveCommand } from './commands/track/track-remove/track-remove.command'
import { DiscordChannel } from './models/discord-channel.entity'
import { DiscordGuild } from './models/discord-guild.entity'
import { DiscordMessage } from './models/discord-message.entity'
import { DiscordUser } from './models/discord-user.entity'
import { DiscordChannelService } from './services/data/discord-channel.service'
import { DiscordGuildService } from './services/data/discord-guild.service'
import { DiscordMessageService } from './services/data/discord-message.service'
import { DiscordUserService } from './services/data/discord-user.service'
import { DiscordClientService } from './services/discord-client.service'
import { DiscordDbService } from './services/discord-db.service'
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
    forwardRef(() => TwitchModule),
  ],
  providers: [
    DiscordService,
    DiscordClientService,
    DiscordDbService,
    DiscordUserService,
    DiscordGuildService,
    DiscordChannelService,
    DiscordMessageService,
    //
    TrackAddCommand,
    TrackAddTwitterTweetCommand,
    TrackAddTwitterProfileCommand,
    TrackAddTwitterSpaceCommand,
    TrackAddTwitCastingLiveCommand,
    TrackAddTwitchUserStreamCommand,
    //
    TrackRemoveCommand,
    TrackRemoveTwitterTweetCommand,
    TrackRemoveTwitterProfileCommand,
    TrackRemoveTwitterSpaceCommand,
    TrackRemoveTwitCastingLiveCommand,
    TrackRemoveTwitchUserStreamCommand,
    //
    GetCommand,
  ],
  exports: [
    DiscordService,
  ],
})
export class DiscordModule { }
