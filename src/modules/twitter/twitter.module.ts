import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterFilteredStreamUser } from './models/twitter-filtered-stream-user.entity'
import { TwitterSpace } from './models/twitter-space.entity'
import { TwitterTweet } from './models/twitter-tweet.entity'
import { TwitterUser } from './models/twitter-user.entity'
import { TwitterApiService } from './services/api/twitter-api.service'
import { TwitterClientService } from './services/api/twitter-client.service'
import { TwitterPublicApiService } from './services/api/twitter-public-api.service'
import { TwitterSpaceControllerService } from './services/controller/twitter-space-controller.service'
import { TwitterUserControllerService } from './services/controller/twitter-user-controller.service'
import { TwitterCronService } from './services/cron/twitter-cron.service'
import { TwitterSpaceCronService } from './services/cron/twitter-space-cron.service'
import { TwitterUserCronService } from './services/cron/twitter-user-cron.service'
import { TwitterFilteredStreamUserService } from './services/data/twitter-filtered-stream-user.service'
import { TwitterSpaceService } from './services/data/twitter-space.service'
import { TwitterUserService } from './services/data/twitter-user.service'
import { TwitterProfileTrackingService } from './services/tracking/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './services/tracking/twitter-space-tracking.service'
import { TwitterTweetTrackingService } from './services/tracking/twitter-tweet-tracking.service'
import { TwitterTokenService } from './services/twitter-token.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitterFilteredStreamUser,
      TwitterUser,
      TwitterTweet,
      TwitterSpace,
    ]),
    ConfigModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitterService,
    TwitterTokenService,
    TwitterClientService,
    TwitterApiService,
    TwitterPublicApiService,
    TwitterFilteredStreamUserService,
    TwitterUserService,
    TwitterSpaceService,
    TwitterUserControllerService,
    TwitterSpaceControllerService,
    TwitterTweetTrackingService,
    TwitterProfileTrackingService,
    TwitterSpaceTrackingService,
    TwitterCronService,
    TwitterUserCronService,
    TwitterSpaceCronService,
  ],
  exports: [
    TwitterService,
    TwitterApiService,
    TwitterPublicApiService,
    TwitterFilteredStreamUserService,
    TwitterUserService,
    TwitterSpaceService,
    TwitterUserControllerService,
    TwitterSpaceControllerService,
    TwitterTweetTrackingService,
  ],
})
export class TwitterModule { }
