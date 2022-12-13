import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitchGame } from './models/twitch-game.entity'
import { TwitchStream } from './models/twitch-stream.entity'
import { TwitchUser } from './models/twitch-user.entity'
import { TwitchApiService } from './services/api/twitch-api.service'
import { TwitchStreamControllerService } from './services/controller/twitch-stream-controller.service'
import { TwitchUserControllerService } from './services/controller/twitch-user-controller.service'
import { TwitchCronService } from './services/cron/twitch-cron.service'
import { TwitchUserCronService } from './services/cron/twitch-user-cron.service'
import { TwitchGameService } from './services/data/twitch-game.service'
import { TwitchStreamService } from './services/data/twitch-stream.service'
import { TwitchUserService } from './services/data/twitch-user.service'
import { TwitchChatTrackingService } from './services/tracking/twitch-chat-tracking.service'
import { TwitchLiveTrackingService } from './services/tracking/twitch-live-tracking.service'
import { TwitchTokenService } from './services/twitch-token.service'
import { TwitchService } from './services/twitch.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitchUser,
      TwitchStream,
      TwitchGame,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitchService,
    TwitchTokenService,
    TwitchApiService,
    TwitchUserService,
    TwitchStreamService,
    TwitchGameService,
    TwitchUserControllerService,
    TwitchStreamControllerService,
    TwitchLiveTrackingService,
    TwitchChatTrackingService,
    TwitchCronService,
    TwitchUserCronService,
  ],
  exports: [
    TwitchService,
    TwitchApiService,
    TwitchUserService,
    TwitchStreamService,
    TwitchGameService,
    TwitchUserControllerService,
    TwitchStreamControllerService,
    TwitchChatTrackingService,
  ],
})
export class TwitchModule { }
