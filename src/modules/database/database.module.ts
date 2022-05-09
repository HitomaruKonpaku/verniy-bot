import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DATABASE_ENTITIES } from './constants/database.constant'
import { DiscordChannelService } from './services/discord-channel.service'
import { DiscordGuildService } from './services/discord-guild.service'
import { DiscordUserService } from './services/discord-user.service'
import { TrackTwitterProfileService } from './services/track-twitter-profile.service'
import { TrackTwitterTweetService } from './services/track-twitter-tweet.service'
import { TwitterUserService } from './services/twitter-user.service'

const services = [
  DiscordUserService,
  DiscordGuildService,
  DiscordChannelService,
  TwitterUserService,
  TrackTwitterTweetService,
  TrackTwitterProfileService,
]

@Module({
  imports: [TypeOrmModule.forFeature(DATABASE_ENTITIES)],
  providers: [...services],
  exports: [...services],
})
export class DatabaseModule { }
