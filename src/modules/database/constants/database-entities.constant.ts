import { DiscordChannel } from '../../discord/models/discord-channel.entity'
import { DiscordGuild } from '../../discord/models/discord-guild.entity'
import { DiscordMessage } from '../../discord/models/discord-message.entity'
import { DiscordUser } from '../../discord/models/discord-user.entity'
import { TrackTwitCastingLive } from '../../track/models/track-twitcating-live.entity'
import { TrackTwitterProfile } from '../../track/models/track-twitter-profile.entity'
import { TrackTwitterSpace } from '../../track/models/track-twitter-space.entity'
import { TrackTwitterTweet } from '../../track/models/track-twitter-tweet.entity'
import { TwitCastingMovie } from '../../twitcasting/models/twitcasting-movie.entity'
import { TwitCastingUser } from '../../twitcasting/models/twitcasting-user.entity'
import { TwitterFilteredStreamUser } from '../../twitter/models/twitter-filtered-stream-user.entity'
import { TwitterSpace } from '../../twitter/models/twitter-space.entity'
import { TwitterUser } from '../../twitter/models/twitter-user.entity'

export const DB_ENTITIES = [
  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  DiscordMessage,
  TwitterFilteredStreamUser,
  TwitterUser,
  TwitterSpace,
  TwitCastingUser,
  TwitCastingMovie,
  TrackTwitterTweet,
  TrackTwitterProfile,
  TrackTwitterSpace,
  TrackTwitCastingLive,
]
