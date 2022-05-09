import { DiscordChannel } from '../models/discord-channel'
import { DiscordGuild } from '../models/discord-guild'
import { DiscordUser } from '../models/discord-user'
import { TrackTwitterProfile } from '../models/track-twitter-profile'
import { TrackTwitterSpace } from '../models/track-twitter-space'
import { TrackTwitterTweet } from '../models/track-twitter-tweet'
import { TwitterUser } from '../models/twitter-user'

export const DATABASE_FILE = './db/database.sqlite'
export const DATABASE_ENTITIES = [
  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  TwitterUser,
  TrackTwitterTweet,
  TrackTwitterProfile,
  TrackTwitterSpace,
]
