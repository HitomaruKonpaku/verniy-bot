import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitchGame } from './model/twitch-game.entity'
import { TwitchStream } from './model/twitch-stream.entity'
import { TwitchUser } from './model/twitch-user.entity'
import { TwitchApiService } from './service/api/twitch-api.service'
import { TwitchStreamControllerService } from './service/controller/twitch-stream-controller.service'
import { TwitchTeamControllerService } from './service/controller/twitch-team-controller.service'
import { TwitchUserControllerService } from './service/controller/twitch-user-controller.service'
import { TwitchCronService } from './service/cron/twitch-cron.service'
import { TwitchUserCronService } from './service/cron/twitch-user-cron.service'
import { TwitchGameService } from './service/data/twitch-game.service'
import { TwitchStreamService } from './service/data/twitch-stream.service'
import { TwitchUserService } from './service/data/twitch-user.service'
import { TwitchChatTrackingService } from './service/tracking/twitch-chat-tracking.service'
import { TwitchLiveTrackingService } from './service/tracking/twitch-live-tracking.service'
import { TwitchTokenService } from './service/twitch-token.service'
import { TwitchService } from './service/twitch.service'

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
    TwitchTeamControllerService,

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
    TwitchTeamControllerService,

    TwitchChatTrackingService,
  ],
})
export class TwitchModule { }
