import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterFilteredStreamUser } from './model/twitter-filtered-stream-user.entity'
import { TwitterSpace } from './model/twitter-space.entity'
import { TwitterTweet } from './model/twitter-tweet.entity'
import { TwitterUser } from './model/twitter-user.entity'
import { TwitterApiService } from './service/api/twitter-api.service'
import { TwitterClientService } from './service/api/twitter-client.service'
import { TwitterPublicApiService } from './service/api/twitter-public-api.service'
import { TwitterSpaceControllerService } from './service/controller/twitter-space-controller.service'
import { TwitterUserControllerService } from './service/controller/twitter-user-controller.service'
import { TwitterCronService } from './service/cron/twitter-cron.service'
import { TwitterSpaceCronService } from './service/cron/twitter-space-cron.service'
import { TwitterUserCronService } from './service/cron/twitter-user-cron.service'
import { TwitterFilteredStreamUserService } from './service/data/twitter-filtered-stream-user.service'
import { TwitterSpaceService } from './service/data/twitter-space.service'
import { TwitterUserService } from './service/data/twitter-user.service'
import { TwitterProfileTrackingService } from './service/tracking/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './service/tracking/twitter-space-tracking.service'
import { TwitterTweetTrackingService } from './service/tracking/twitter-tweet-tracking.service'
import { TwitterTokenService } from './service/twitter-token.service'
import { TwitterService } from './service/twitter.service'

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
