import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitchStream } from './models/twitch-stream.entity'
import { TwitchUser } from './models/twitch-user.entity'
import { TwitchApiService } from './services/api/twitch-api.service'
import { TwitchStreamControllerService } from './services/controller/twitch-stream-controller.service'
import { TwitchUserControllerService } from './services/controller/twitch-user-controller.service'
import { TwitchStreamService } from './services/data/twitch-stream.service'
import { TwitchUserService } from './services/data/twitch-user.service'
import { TwitchLiveTrackingService } from './services/tracking/twitch-live-tracking.service'
import { TwitchTokenService } from './services/twitch-token.service'
import { TwitchService } from './services/twitch.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitchUser,
      TwitchStream,
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
    TwitchUserControllerService,
    TwitchStreamControllerService,
    TwitchLiveTrackingService,
  ],
  exports: [
    TwitchService,
    TwitchApiService,
    TwitchUserService,
    TwitchStreamService,
    TwitchUserControllerService,
    TwitchStreamControllerService,
  ],
})
export class TwitchModule { }
