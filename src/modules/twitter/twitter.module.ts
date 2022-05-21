import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '../config/config.module'
import { DiscordModule } from '../discord/discord.module'
import { TrackModule } from '../track/track.module'
import { TwitterSpace } from './models/twitter-space.entity'
import { TwitterUser } from './models/twitter-user.entity'
import { TwitterApiPublicService } from './services/twitter-api-public.service'
import { TwitterApiService } from './services/twitter-api.service'
import { TwitterClientService } from './services/twitter-client.service'
import { TwitterCronService } from './services/twitter-cron.service'
import { TwitterProfileTrackingService } from './services/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './services/twitter-space-tracking.service'
import { TwitterSpaceService } from './services/twitter-space.service'
import { TwitterTokenService } from './services/twitter-token.service'
import { TwitterTweetTrackingService } from './services/twitter-tweet-tracking.service'
import { TwitterUserService } from './services/twitter-user.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
