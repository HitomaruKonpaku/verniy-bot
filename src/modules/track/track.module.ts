import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrackTwitCastingLive } from './models/track-twitcasting-live.entity'
import { TrackTwitchStream } from './models/track-twitch-stream.entity'
import { TrackTwitterProfile } from './models/track-twitter-profile.entity'
import { TrackTwitterSpace } from './models/track-twitter-space.entity'
import { TrackTwitterTweet } from './models/track-twitter-tweet.entity'
import { TrackTwitCastingLiveService } from './services/track-twitcasting-live.service'
import { TrackTwitchStreamService } from './services/track-twitch-stream.service'
import { TrackTwitterProfileService } from './services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from './services/track-twitter-space.service'
import { TrackTwitterTweetService } from './services/track-twitter-tweet.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackTwitterTweet,
      TrackTwitterProfile,
      TrackTwitterSpace,
      TrackTwitCastingLive,
      TrackTwitchStream,
    ]),
  ],
  providers: [
    TrackTwitterTweetService,
    TrackTwitterProfileService,
    TrackTwitterSpaceService,
    TrackTwitCastingLiveService,
    TrackTwitchStreamService,
  ],
  exports: [
    TrackTwitterTweetService,
    TrackTwitterProfileService,
    TrackTwitterSpaceService,
    TrackTwitCastingLiveService,
    TrackTwitchStreamService,
  ],
})
export class TrackModule { }
