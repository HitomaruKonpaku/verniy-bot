import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrackTwitterProfile } from './models/track-twitter-profile.entity'
import { TrackTwitterSpace } from './models/track-twitter-space.entity'
import { TrackTwitterTweet } from './models/track-twitter-tweet.entity'
import { TrackTwitterProfileService } from './services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from './services/track-twitter-space.service'
import { TrackTwitterTweetService } from './services/track-twitter-tweet.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackTwitterTweet,
      TrackTwitterProfile,
      TrackTwitterSpace,
    ]),
  ],
  providers: [
    TrackTwitterTweetService,
    TrackTwitterProfileService,
    TrackTwitterSpaceService,
  ],
  exports: [
    TrackTwitterTweetService,
    TrackTwitterProfileService,
    TrackTwitterSpaceService,
  ],
})
export class TrackModule { }
