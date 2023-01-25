import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingMovie } from './model/twitcasting-movie.entity'
import { TwitCastingUser } from './model/twitcasting-user.entity'
import { TwitCastingApiPublicService } from './service/api/twitcasting-api-public.service'
import { TwitCastingApiService } from './service/api/twitcasting-api.service'
import { TwitCastingMovieControllerService } from './service/controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from './service/controller/twitcasting-user-controller.service'
import { TwitCastingCronService } from './service/cron/twitcasting-cron.service'
import { TwitCastingMovieCronService } from './service/cron/twitcasting-movie-cron.service'
import { TwitCastingUserCronService } from './service/cron/twitcasting-user-cron.service'
import { TwitCastingMovieService } from './service/data/twitcasting-movie.service'
import { TwitCastingUserService } from './service/data/twitcasting-user.service'
import { TwitCastingLiveTrackingService } from './service/tracking/twitcasting-live-tracking.service'
import { TwitCastingService } from './service/twitcasting.service'

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
    TwitCastingUserControllerService,
    TwitCastingMovieControllerService,
    TwitCastingLiveTrackingService,
    TwitCastingCronService,
    TwitCastingUserCronService,
    TwitCastingMovieCronService,
  ],
  exports: [
    TwitCastingService,
    TwitCastingApiService,
    TwitCastingApiPublicService,
    TwitCastingUserService,
    TwitCastingMovieService,
    TwitCastingUserControllerService,
    TwitCastingMovieControllerService,
  ],
})
export class TwitCastingModule { }
