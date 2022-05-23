import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingMovie } from './models/twitcasting-movie.entity'
import { TwitCastingUser } from './models/twitcasting-user.entity'
import { TwitCastingApiPublicService } from './services/twitcasting-api-public.service'
import { TwitCastingApiService } from './services/twitcasting-api.service'
import { TwitCastingLiveTrackingService } from './services/twitcasting-live-tracking.service'
import { TwitCastingMovieService } from './services/twitcasting-movie.service'
import { TwitCastingUserService } from './services/twitcasting-user.service'
import { TwitCastingService } from './services/twitcasting.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitCastingUser,
      TwitCastingMovie,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitCastingService,
    TwitCastingApiService,
    TwitCastingApiPublicService,
    TwitCastingUserService,
    TwitCastingMovieService,
    TwitCastingLiveTrackingService,
  ],
  exports: [
    TwitCastingService,
    TwitCastingApiService,
    TwitCastingApiPublicService,
    TwitCastingUserService,
    TwitCastingMovieService,
  ],
})
export class TwitCastingModule { }
