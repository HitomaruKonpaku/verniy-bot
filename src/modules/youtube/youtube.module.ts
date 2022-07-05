import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { YoutubeChannel } from './models/youtube-channel.entity'
import { YoutubeVideo } from './models/youtube-video.entity'
import { YoutubeApiService } from './services/api/youtube-api.service'
import { YoutubeChannelControllerService } from './services/controller/youtube-channel-controller.service'
import { YoutubeVideoControllerService } from './services/controller/youtube-video-controller.service'
import { YoutubeChannelService } from './services/data/youtube-channel.service'
import { YoutubeVideoService } from './services/data/youtube-video.service'
import { YoutubeLiveTrackingService } from './services/tracking/youtube-live-tracking.service'
import { YoutubeService } from './services/youtube.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    YoutubeService,
    YoutubeApiService,
    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChannelControllerService,
    YoutubeVideoControllerService,
    YoutubeLiveTrackingService,
  ],
  exports: [
    YoutubeService,
    YoutubeApiService,
    YoutubeChannelService,
    YoutubeVideoService,
    YoutubeChannelControllerService,
    YoutubeVideoControllerService,
  ],
})
export class YoutubeModule { }
