import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DiscordChannel } from './models/discord-channel'
import { DiscordGuild } from './models/discord-guild'
import { DiscordUser } from './models/discord-user'
import { TwitterDiscordProfile } from './models/twitter-discord-profile'
import { TwitterDiscordTweet } from './models/twitter-discord-tweet'
import { TwitterUser } from './models/twitter-user'
import { DiscordChannelService } from './services/discord-channel.service'
import { DiscordGuildService } from './services/discord-guild.service'
import { DiscordUserService } from './services/discord-user.service'
import { TwitterDiscordProfileService } from './services/twitter-discord-profile.service'
import { TwitterDiscordTweetService } from './services/twitter-discord-tweet.service'
import { TwitterUserService } from './services/twitter-user.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscordUser,
      DiscordGuild,
      DiscordChannel,
      TwitterUser,
      TwitterDiscordTweet,
      TwitterDiscordProfile,
    ]),
  ],
  providers: [
    DiscordUserService,
    DiscordGuildService,
    DiscordChannelService,
    TwitterUserService,
    TwitterDiscordTweetService,
    TwitterDiscordProfileService,
  ],
  exports: [
    DiscordUserService,
    DiscordGuildService,
    DiscordChannelService,
    TwitterUserService,
    TwitterDiscordTweetService,
    TwitterDiscordProfileService,
  ],
})
export class DatabaseModule { }
