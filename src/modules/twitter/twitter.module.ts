import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterFilteredStreamUser } from './models/twitter-filtered-stream-user.entity'
import { TwitterSpace } from './models/twitter-space.entity'
import { TwitterUser } from './models/twitter-user.entity'
import { TwitterApiPublicService } from './services/api/twitter-api-public.service'
import { TwitterApiService } from './services/api/twitter-api.service'
import { TwitterClientService } from './services/api/twitter-client.service'
import { TwitterFilteredStreamUserService } from './services/data/twitter-filtered-stream-user.service'
import { TwitterSpaceService } from './services/data/twitter-space.service'
import { TwitterUserService } from './services/data/twitter-user.service'
import { TwitterProfileTrackingService } from './services/tracking/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './services/tracking/twitter-space-tracking.service'
import { TwitterTweetTrackingService } from './services/tracking/twitter-tweet-tracking.service'
import { TwitterCronService } from './services/twitter-cron.service'
import { TwitterTokenService } from './services/twitter-token.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TwitterFilteredStreamUser,
      TwitterUser,
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
    TwitterApiPublicService,
    TwitterFilteredStreamUserService,
    TwitterUserService,
    TwitterSpaceService,
    TwitterTweetTrackingService,
    TwitterProfileTrackingService,
    TwitterSpaceTrackingService,
    TwitterCronService,
  ],
  exports: [
    TwitterService,
    TwitterApiService,
    TwitterApiPublicService,
    TwitterUserService,
    TwitterSpaceService,
  ],
})
export class TwitterModule { }
