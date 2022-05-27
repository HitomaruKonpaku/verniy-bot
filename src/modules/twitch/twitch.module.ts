import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitchApiService } from './services/api/twitch-api.service'
import { TwitchTokenService } from './services/twitch-token.service'
import { TwitchService } from './services/twitch.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitchService,
    TwitchTokenService,
    TwitchApiService,
  ],
  exports: [
    TwitchService,
    TwitchApiService,
  ],
})
export class TwitchModule { }
