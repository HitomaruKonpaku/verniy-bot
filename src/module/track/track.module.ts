import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Track } from './model/base/track.entity'
import { TrackInstagramPost } from './model/track-instagram-post.entity'
import { TrackInstagramProfile } from './model/track-instagram-profile.entity'
import { TrackInstagramStory } from './model/track-instagram-story.entity'
import { TrackTiktokVideo } from './model/track-tiktok-video.entity'
import { TrackTwitCastingLive } from './model/track-twitcasting-live.entity'
import { TrackTwitchChat } from './model/track-twitch-chat.entity'
import { TrackTwitchLive } from './model/track-twitch-live.entity'
import { TrackTwitterProfile } from './model/track-twitter-profile.entity'
import { TrackTwitterSpace } from './model/track-twitter-space.entity'
import { TrackTwitterTweet } from './model/track-twitter-tweet.entity'
import { TrackYoutubeLive } from './model/track-youtube-live.entity'
import { TrackInstagramPostService } from './service/track-instagram-post.service'
import { TrackInstagramProfileService } from './service/track-instagram-profile.service'
import { TrackInstagramStoryService } from './service/track-instagram-story.service'
import { TrackListService } from './service/track-list.service'
import { TrackTiktokVideoService } from './service/track-tiktok-video.service'
import { TrackTwitCastingLiveService } from './service/track-twitcasting-live.service'
import { TrackTwitchChatService } from './service/track-twitch-chat.service'
import { TrackTwitchLiveService } from './service/track-twitch-live.service'
import { TrackTwitterProfileService } from './service/track-twitter-profile.service'
import { TrackTwitterSpaceService } from './service/track-twitter-space.service'
import { TrackTwitterTweetService } from './service/track-twitter-tweet.service'
import { TrackYoutubeLiveService } from './service/track-youtube-live.service'
import { TrackService } from './service/track.service'

const services = [
  TrackService,
  TrackListService,
  TrackTwitterTweetService,
  TrackTwitterProfileService,
  TrackTwitterSpaceService,
  TrackTwitCastingLiveService,
  TrackYoutubeLiveService,
  TrackTwitchLiveService,
  TrackTwitchChatService,
  TrackInstagramProfileService,
  TrackInstagramPostService,
  TrackInstagramStoryService,
  TrackTiktokVideoService,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Track,
      TrackTwitterTweet,
      TrackTwitterProfile,
      TrackTwitterSpace,
      TrackTwitCastingLive,
      TrackYoutubeLive,
      TrackTwitchLive,
      TrackTwitchChat,
      TrackInstagramProfile,
      TrackInstagramPost,
      TrackInstagramStory,
      TrackTiktokVideo,
    ]),
  ],
  providers: [
    ...services,
  ],
  exports: [
    ...services,
  ],
})
export class TrackModule { }
