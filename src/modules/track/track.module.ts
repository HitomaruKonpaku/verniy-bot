import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrackInstagramPost } from './models/track-instagram-post.entity'
import { TrackInstagramProfile } from './models/track-instagram-profile.entity'
import { TrackInstagramStory } from './models/track-instagram-story.entity'
import { TrackTiktokVideo } from './models/track-tiktok-video.entity'
import { TrackTwitCastingLive } from './models/track-twitcasting-live.entity'
import { TrackTwitchLive } from './models/track-twitch-live.entity'
import { TrackTwitterProfile } from './models/track-twitter-profile.entity'
import { TrackTwitterSpace } from './models/track-twitter-space.entity'
import { TrackTwitterTweet } from './models/track-twitter-tweet.entity'
import { TrackYoutubeLive } from './models/track-youtube-live.entity'
import { TrackInstagramPostService } from './services/track-instagram-post.service'
import { TrackInstagramProfileService } from './services/track-instagram-profile.service'
import { TrackInstagramStoryService } from './services/track-instagram-story.service'
import { TrackTiktokVideoService } from './services/track-tiktok-video.service'
import { TrackTwitCastingLiveService } from './services/track-twitcasting-live.service'
import { TrackTwitchLiveService } from './services/track-twitch-live.service'
import { TrackTwitterProfileService } from './services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from './services/track-twitter-space.service'
import { TrackTwitterTweetService } from './services/track-twitter-tweet.service'
import { TrackYoutubeLiveService } from './services/track-youtube-live.service'

const services = [
  TrackTwitterTweetService,
  TrackTwitterProfileService,
  TrackTwitterSpaceService,
  TrackTwitCastingLiveService,
  TrackYoutubeLiveService,
  TrackTwitchLiveService,
  TrackInstagramProfileService,
  TrackInstagramPostService,
  TrackInstagramStoryService,
  TrackTiktokVideoService,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackTwitterTweet,
      TrackTwitterProfile,
      TrackTwitterSpace,
      TrackTwitCastingLive,
      TrackYoutubeLive,
      TrackTwitchLive,
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
