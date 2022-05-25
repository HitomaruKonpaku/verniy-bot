import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitCastingMovie } from './models/twitcasting-movie.entity'
import { TwitCastingUser } from './models/twitcasting-user.entity'
import { TwitCastingApiPublicService } from './services/api/twitcasting-api-public.service'
import { TwitCastingApiService } from './services/api/twitcasting-api.service'
import { TwitCastingMovieControllerService } from './services/controller/twitcasting-movie-controller.service'
import { TwitCastingUserControllerService } from './services/controller/twitcasting-user-controller.service'
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
    TwitCastingUserControllerService,
    TwitCastingMovieControllerService,
    TwitCastingLiveTrackingService,
    TwitCastingCronService,
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
