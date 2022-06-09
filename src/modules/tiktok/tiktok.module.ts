import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TiktokUser } from './models/tiktok-user.entity'
import { TiktokVideo } from './models/tiktok-video.entity'
import { TiktokApiService } from './services/api/tiktok-api.service'
import { TiktokProxyService } from './services/api/tiktok-proxy.service'
import { TiktokUserControllerService } from './services/controller/tiktok-user-controller.service'
import { TiktokVideoControllerService } from './services/controller/tiktok-video-controller.service'
import { TiktokUserService } from './services/data/tiktok-user.service'
import { TiktokVideoService } from './services/data/tiktok-video.service'
import { TiktokTrackingService } from './services/tiktok-tracking.service'
import { TiktokService } from './services/tiktok.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TiktokUser,
      TiktokVideo,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TiktokService,
    TiktokProxyService,
    TiktokApiService,
    TiktokUserService,
    TiktokVideoService,
    TiktokUserControllerService,
    TiktokVideoControllerService,
    TiktokTrackingService,
  ],
  exports: [
    TiktokService,
    TiktokApiService,
    TiktokUserService,
    TiktokVideoService,
    TiktokUserControllerService,
    TiktokVideoControllerService,
  ],
})
export class TiktokModule { }
