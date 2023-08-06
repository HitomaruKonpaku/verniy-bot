import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { YoutubeChannel } from './model/youtube-channel.entity'
import { YoutubePlaylistItem } from './model/youtube-playlist-item.entity'
import { YoutubePlaylist } from './model/youtube-playlist.entity'
import { YoutubePost } from './model/youtube-post.entity'
import { YoutubeVideo } from './model/youtube-video.entity'
import { YoutubeBaseApiService } from './service/api/base/youtube-base-api.service'
import { YoutubeApiClientService } from './service/api/client/youtube-api-client.service'
import { YoutubeChannelApiService } from './service/api/youtube-channel-api.service'
import { YoutubePlaylistApiService } from './service/api/youtube-playlist-api.service'
import { YoutubePlaylistItemApiService } from './service/api/youtube-playlist-item-api.service'
import { YoutubeVideoApiService } from './service/api/youtube-video-api.service'
import { YoutubeChannelControllerService } from './service/controller/youtube-channel-controller.service'
import { YoutubePostControllerService } from './service/controller/youtube-post-controller.service'
import { YoutubeVideoControllerService } from './service/controller/youtube-video-controller.service'
import { YoutubeChannelCronService } from './service/cron/youtube-channel-cron.service'
import { YoutubeCronService } from './service/cron/youtube-cron.service'
import { YoutubeChannelService } from './service/data/youtube-channel.service'
import { YoutubePostService } from './service/data/youtube-post.service'
import { YoutubeVideoService } from './service/data/youtube-video.service'
import { YoutubeCommunityTrackingService } from './service/tracking/youtube-community-tracking.service'
import { YoutubeLiveTrackingService } from './service/tracking/youtube-live-tracking.service'
import { YoutubeService } from './service/youtube.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      YoutubeChannel,
      YoutubeVideo,
      YoutubePlaylist,
      YoutubePlaylistItem,
      YoutubePost,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    YoutubeService,
    YoutubeApiClientService,

    YoutubeBaseApiService,
    YoutubeChannelApiService,
    YoutubeVideoApiService,
    YoutubePlaylistApiService,
    YoutubePlaylistItemApiService,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubePostService,

    YoutubeChannelControllerService,
    YoutubeVideoControllerService,
    YoutubePostControllerService,

    YoutubeLiveTrackingService,
    YoutubeCommunityTrackingService,

    YoutubeCronService,
    YoutubeChannelCronService,
  ],
  exports: [
    YoutubeService,
    YoutubeBaseApiService,

    YoutubeChannelService,
    YoutubeVideoService,
    YoutubePostService,

    YoutubeChannelControllerService,
    YoutubeVideoControllerService,
    YoutubePostControllerService,
  ],
})
export class YoutubeModule { }
