import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { DatabaseModule } from '../database/database.module'
import { DiscordModule } from '../discord/discord.module'
import { TwitterApiService } from './services/twitter-api.service'
import { TwitterClientService } from './services/twitter-client.service'
import { TwitterProfileService } from './services/twitter-profile.service'
import { TwitterTweetService } from './services/twitter-tweet.service'
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
    TwitterTweetService,
    TwitterProfileService,
  ],
  exports: [
    TwitterService,
    TwitterApiService,
  ],
})
export class TwitterModule { }
