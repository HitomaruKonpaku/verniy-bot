import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DB_ENTITIES } from './constants/database-entities.constant'
import { DiscordChannelService } from './services/discord-channel.service'
import { DiscordGuildService } from './services/discord-guild.service'
import { DiscordUserService } from './services/discord-user.service'
import { TrackTwitterProfileService } from './services/track-twitter-profile.service'
import { TrackTwitterSpaceService } from './services/track-twitter-space.service'
import { TrackTwitterTweetService } from './services/track-twitter-tweet.service'
import { TwitterSpaceService } from './services/twitter-space.service'
import { TwitterUserService } from './services/twitter-user.service'

const services = [
  // Discord
  DiscordUserService,
  DiscordGuildService,
  DiscordChannelService,
  // Twitter
  TwitterUserService,
  TwitterSpaceService,
  // Tracking
  TrackTwitterTweetService,
  TrackTwitterProfileService,
  TrackTwitterSpaceService,
]

@Module({
  imports: [TypeOrmModule.forFeature(DB_ENTITIES)],
  providers: [...services],
  exports: [...services],
})
export class DatabaseModule { }
