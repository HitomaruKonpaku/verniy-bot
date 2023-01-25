import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { TiktokUser } from './model/tiktok-user.entity'
import { TiktokVideo } from './model/tiktok-video.entity'
import { TiktokApiService } from './service/api/tiktok-api.service'
import { TiktokProxyService } from './service/api/tiktok-proxy.service'
import { TiktokUserControllerService } from './service/controller/tiktok-user-controller.service'
import { TiktokVideoControllerService } from './service/controller/tiktok-video-controller.service'
import { TiktokUserService } from './service/data/tiktok-user.service'
import { TiktokVideoService } from './service/data/tiktok-video.service'
import { TiktokTrackingService } from './service/tiktok-tracking.service'
import { TiktokService } from './service/tiktok.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TiktokUser,
      TiktokVideo,
    ]),
    ConfigModule,
    TrackModule,
    TwitterModule,
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
