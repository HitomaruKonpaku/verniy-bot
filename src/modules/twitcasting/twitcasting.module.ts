import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingMovie } from './models/twitcasting-movie.entity'
import { TwitCastingUser } from './models/twitcasting-user.entity'
import { TwitCastingApiPublicService } from './services/api/twitcasting-api-public.service'
import { TwitCastingApiService } from './services/api/twitcasting-api.service'
import { TwitCastingMovieControlService } from './services/control/twitcasting-movie-control.service'
import { TwitCastingUserControlService } from './services/control/twitcasting-user-control.service'
import { TwitCastingMovieService } from './services/data/twitcasting-movie.service'
import { TwitCastingUserService } from './services/data/twitcasting-user.service'
import { TwitCastingLiveTrackingService } from './services/tracking/twitcasting-live-tracking.service'
import { TwitCastingCronService } from './services/twitcasting-cron.service'
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
    TwitCastingUserControlService,
    TwitCastingMovieControlService,
    TwitCastingLiveTrackingService,
    TwitCastingCronService,
  ],
  exports: [
    TwitCastingService,
    TwitCastingApiService,
    TwitCastingApiPublicService,
    TwitCastingUserService,
    TwitCastingMovieService,
    TwitCastingUserControlService,
    TwitCastingMovieControlService,
  ],
})
export class TwitCastingModule { }
