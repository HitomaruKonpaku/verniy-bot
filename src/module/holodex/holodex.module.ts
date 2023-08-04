import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { TrackModule } from '../track/track.module'
import { TwitterModule } from '../twitter/twitter.module'
import { YoutubeModule } from '../youtube/youtube.module'
import { HolodexChannel } from './model/holodex-channel.entity'
import { HolodexChannelAccount } from './model/holodex-channel_account.entity'
import { HolodexExternalStream } from './model/holodex-external-stream.entity'
import { HolodexVideo } from './model/holodex-video.entity'
import { HolodexApiService } from './service/api/holodex-api.service'
import { HolodexChannelControllerService } from './service/controller/holodex-channel-controller.service'
import { HolodexVideoControllerService } from './service/controller/holodex-video-controller.service'
import { HolodexChannelAccountService } from './service/data/holodex-channel-account.service'
import { HolodexChannelService } from './service/data/holodex-channel.service'
import { HolodexExternalStreamService } from './service/data/holodex-external-stream.service'
import { HolodexVideoService } from './service/data/holodex-video.service'
import { HolodexService } from './service/holodex.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HolodexChannel,
      HolodexChannelAccount,
      HolodexVideo,
      HolodexExternalStream,
    ]),
    ConfigModule,
    TrackModule,
    TwitterModule,
    YoutubeModule,
  ],
  providers: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexChannelAccountService,
    HolodexVideoService,
    HolodexExternalStreamService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,
  ],
  exports: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexChannelAccountService,
    HolodexVideoService,
    HolodexExternalStreamService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,
  ],
})
export class HolodexModule { }
