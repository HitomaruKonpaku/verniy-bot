import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { DatabaseModule } from '../database/database.module'
import { DiscordModule } from '../discord/discord.module'
import { TwitterApiService } from './services/twitter-api.service'
import { TwitterClientService } from './services/twitter-client.service'
import { TwitterProfileTrackingService } from './services/twitter-profile-tracking.service'
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
    TwitterClientService,
    TwitterApiService,
    TwitterTweetTrackingService,
    TwitterProfileTrackingService,
  ],
  exports: [
    TwitterService,
    TwitterApiService,
  ],
})
export class TwitterModule { }
