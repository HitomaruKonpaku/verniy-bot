import { DiscordChannel } from '../models/discord-channel.entity'
import { DiscordGuild } from '../models/discord-guild.entity'
import { DiscordUser } from '../models/discord-user.entity'
import { TrackTwitterProfile } from '../models/track-twitter-profile.entity'
import { TrackTwitterSpace } from '../models/track-twitter-space.entity'
import { TrackTwitterTweet } from '../models/track-twitter-tweet.entity'
import { TwitterSpace } from '../models/twitter-space.entity'
import { TwitterUser } from '../models/twitter-user.entity'

export const DB_ENTITIES = [
  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  TwitterUser,
  TwitterSpace,
  TrackTwitterTweet,
  TrackTwitterProfile,
  TrackTwitterSpace,
]
