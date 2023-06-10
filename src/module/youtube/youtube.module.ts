import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { YoutubeChannel } from './model/youtube-channel.entity'
import { YoutubePlaylistItem } from './model/youtube-playlist-item.entity'
import { YoutubePlaylist } from './model/youtube-playlist.entity'
import { YoutubeVideo } from './model/youtube-video.entity'
import { YoutubeApiService } from './service/api/youtube-api.service'
import { YoutubeChannelApiService } from './service/api/youtube-channel-api.service'
import { YoutubePlaylistApiService } from './service/api/youtube-playlist-api.service'
import { YoutubePlaylistItemApiService } from './service/api/youtube-playlist-item-api.service'
import { YoutubeVideoApiService } from './service/api/youtube-video-api.service'
import { YoutubeChannelControllerService } from './service/controller/youtube-channel-controller.service'
import { YoutubeVideoControllerService } from './service/controller/youtube-video-controller.service'
import { YoutubeChannelCronService } from './service/cron/youtube-channel-cron.service'
import { YoutubeCronService } from './service/cron/youtube-cron.service'
import { YoutubeChannelService } from './service/data/youtube-channel.service'
import { YoutubeVideoService } from './service/data/youtube-video.service'
import { YoutubeLiveTrackingService } from './service/tracking/youtube-live-tracking.service'
import { YoutubeClientService } from './service/youtube-client.service'
import { YoutubeService } from './service/youtube.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
      YoutubePlaylist,
      YoutubePlaylistItem,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    YoutubeService,
    YoutubeClientService,

    YoutubeApiService,
    YoutubeChannelApiService,
    YoutubeVideoApiService,
    YoutubePlaylistApiService,
    YoutubePlaylistItemApiService,

    YoutubeChannelService,
    YoutubeVideoService,

    YoutubeChannelControllerService,
    YoutubeVideoControllerService,

    YoutubeLiveTrackingService,

    YoutubeCronService,
    YoutubeChannelCronService,
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
