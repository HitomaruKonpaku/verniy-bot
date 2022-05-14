import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { DatabaseModule } from '../database/database.module'
import { DiscordModule } from '../discord/discord.module'
import { TwitterApiPublicService } from './services/twitter-api-public.service'
import { TwitterApiService } from './services/twitter-api.service'
import { TwitterClientService } from './services/twitter-client.service'
import { TwitterProfileTrackingService } from './services/twitter-profile-tracking.service'
import { TwitterSpaceTrackingService } from './services/twitter-space-tracking.service'
import { TwitterTokenService } from './services/twitter-token.service'
import { TwitterTweetTrackingService } from './services/twitter-tweet-tracking.service'
import { TwitterService } from './services/twitter.service'

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [
    TwitterService,
    TwitterTokenService,
    TwitterClientService,
    TwitterApiService,
    TwitterApiPublicService,
    TwitterTweetTrackingService,
    TwitterProfileTrackingService,
    TwitterSpaceTrackingService,
  ],
  exports: [
    TwitterService,
    TwitterApiService,
    TwitterApiPublicService,
  ],
})
export class TwitterModule { }
