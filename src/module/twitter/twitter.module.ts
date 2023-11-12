import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigVarModule } from '../config-var/config-var.module'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterApi } from './api/twitter.api'
import { TwitterBroadcast } from './model/twitter-broadcast.entity'
import { TwitterFilteredStreamUser } from './model/twitter-filtered-stream-user.entity'
import { TwitterSpace } from './model/twitter-space.entity'
import { TwitterTweet } from './model/twitter-tweet.entity'
import { TwitterUser } from './model/twitter-user.entity'
import { TwitterApiService } from './service/api/twitter-api.service'
import { TwitterClientService } from './service/api/twitter-client.service'
import { TwitterGraphqlSpaceService } from './service/api/twitter-graphql-space.service'
import { TwitterGraphqlTweetService } from './service/api/twitter-graphql-tweet.service'
import { TwitterGraphqlUserService } from './service/api/twitter-graphql-user.service'
import { TwitterPublicApiService } from './service/api/twitter-public-api.service'
import { TwitterBroadcastControllerService } from './service/controller/twitter-broardcast-controller.service'
import { TwitterSpaceControllerService } from './service/controller/twitter-space-controller.service'
import { TwitterTweetControllerService } from './service/controller/twitter-tweet-controller.service'
import { TwitterUserControllerService } from './service/controller/twitter-user-controller.service'
import { TwitterBroadcastCronService } from './service/cron/twitter-broadcast-cron.service'
import { TwitterCronService } from './service/cron/twitter-cron.service'
import { TwitterSpaceCronService } from './service/cron/twitter-space-cron.service'
import { TwitterSpacePlaylistCronService } from './service/cron/twitter-space-playlist-cron.service'
import { TwitterTweetCronService } from './service/cron/twitter-tweet-cron.service'
import { TwitterUserCronService } from './service/cron/twitter-user-cron.service'
import { TwitterBroadcastService } from './service/data/twitter-broadcast.service'
import { TwitterFilteredStreamUserService } from './service/data/twitter-filtered-stream-user.service'
import { TwitterSpaceService } from './service/data/twitter-space.service'
import { TwitterTweetService } from './service/data/twitter-tweet.service'
import { TwitterUserService } from './service/data/twitter-user.service'
import { TwitterFleetlineTrackingService } from './service/tracking/twitter-fleetline-tracking.service'
import { TwitterProfileTrackingService } from './service/tracking/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './service/tracking/twitter-space-tracking.service'
import { TwitterTweetTrackingProfileTweetService } from './service/tracking/twitter-tweet-tracking-profile-tweet.service'
import { TwitterTweetTrackingService } from './service/tracking/twitter-tweet-tracking.service'
import { TwitterService } from './service/twitter.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitterFilteredStreamUser,
      TwitterUser,
      TwitterTweet,
      TwitterSpace,
      TwitterBroadcast,
    ]),
    ConfigModule,
    ConfigVarModule,
    TrackModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitterService,
    TwitterApi,

    TwitterClientService,
    TwitterApiService,
    TwitterPublicApiService,
    TwitterGraphqlUserService,
    TwitterGraphqlTweetService,
    TwitterGraphqlSpaceService,

    TwitterFilteredStreamUserService,
    TwitterUserService,
    TwitterTweetService,
    TwitterSpaceService,
    TwitterBroadcastService,

    TwitterUserControllerService,
    TwitterTweetControllerService,
    TwitterSpaceControllerService,
    TwitterBroadcastControllerService,

    TwitterTweetTrackingService,
    TwitterTweetTrackingProfileTweetService,
    TwitterProfileTrackingService,
    TwitterFleetlineTrackingService,
    TwitterSpaceTrackingService,

    TwitterCronService,
    TwitterUserCronService,
    TwitterSpaceCronService,
    TwitterSpacePlaylistCronService,
    TwitterTweetCronService,
    TwitterBroadcastCronService,
  ],
  exports: [
    TwitterService,

    TwitterApiService,
    TwitterPublicApiService,
    TwitterGraphqlUserService,
    TwitterGraphqlTweetService,
    TwitterGraphqlSpaceService,

    TwitterFilteredStreamUserService,
    TwitterUserService,
    TwitterTweetService,
    TwitterSpaceService,
    TwitterBroadcastService,

    TwitterUserControllerService,
    TwitterTweetControllerService,
    TwitterSpaceControllerService,
    TwitterBroadcastControllerService,

    TwitterTweetTrackingService,
  ],
})
export class TwitterModule { }
