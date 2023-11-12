import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterBroadcast } from '../twitter/model/twitter-broadcast.entity'
import { TwitterSpace } from '../twitter/model/twitter-space.entity'
import { TwitterModule } from '../twitter/twitter.module'
import { YoutubeModule } from '../youtube/youtube.module'
import { HolodexChannel } from './model/holodex-channel.entity'
import { HolodexChannelAccount } from './model/holodex-channel_account.entity'
import { HolodexExternalStream } from './model/holodex-external-stream.entity'
import { HolodexVideo } from './model/holodex-video.entity'
import { HolodexApiService } from './service/api/holodex-api.service'
import { HolodexChannelControllerService } from './service/controller/holodex-channel-controller.service'
import { HolodexVideoControllerService } from './service/controller/holodex-video-controller.service'
import { HolodexBroadcastCronService } from './service/cron/holodex-broadcast-cron.service'
import { HolodexSpaceCronService } from './service/cron/holodex-space-cron.service'
import { HolodexBroadcastService } from './service/data/external/holodex-broadcast.service'
import { HolodexSpaceService } from './service/data/external/holodex-space.service'
import { HolodexChannelAccountService } from './service/data/holodex-channel-account.service'
import { HolodexChannelService } from './service/data/holodex-channel.service'
import { HolodexExternalStreamService } from './service/data/holodex-external-stream.service'
import { HolodexVideoService } from './service/data/holodex-video.service'
import { HolodexService } from './service/holodex.service'
import { HolodexTweetTrackingService } from './service/tracking/holodex-tweet-tracking.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HolodexChannel,
      HolodexChannelAccount,
      HolodexVideo,
      HolodexExternalStream,

      TwitterSpace,
      TwitterBroadcast,
    ]),
    ConfigModule,
    TrackModule,
    TwitterModule,
    YoutubeModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexChannelAccountService,
    HolodexVideoService,
    HolodexExternalStreamService,

    HolodexSpaceService,
    HolodexBroadcastService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,

    HolodexTweetTrackingService,

    HolodexSpaceCronService,
    HolodexBroadcastCronService,
  ],
  exports: [
    HolodexService,
    HolodexApiService,

    HolodexChannelService,
    HolodexChannelAccountService,
    HolodexVideoService,
    HolodexExternalStreamService,

    HolodexSpaceService,
    HolodexBroadcastService,

    HolodexChannelControllerService,
    HolodexVideoControllerService,
  ],
})
export class HolodexModule { }
