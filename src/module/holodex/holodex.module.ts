import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { HolodexChannel } from './model/holodex-channel.entity'
import { HolodexVideo } from './model/holodex-video.entity'
import { HolodexApiService } from './service/api/holodex-api.service'
import { HolodexChannelControllerService } from './service/controller/holodex-channel-controller.service'
import { HolodexVideoControllerService } from './service/controller/holodex-video-controller.service'
import { HolodexChannelService } from './service/data/holodex-channel.service'
import { HolodexVideoService } from './service/data/holodex-video.service'
import { HolodexService } from './service/holodex.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HolodexChannel,
      HolodexVideo,
    ]),
    ConfigModule,
    TrackModule,
    TwitterModule,
  ],
  providers: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexVideoService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,
  ],
  exports: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexVideoService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,
  ],
})
export class HolodexModule { }
