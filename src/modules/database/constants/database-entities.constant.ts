import { DiscordChannel } from '../../discord/models/discord-channel.entity'
import { DiscordGuild } from '../../discord/models/discord-guild.entity'
import { DiscordMessage } from '../../discord/models/discord-message.entity'
import { DiscordUser } from '../../discord/models/discord-user.entity'
import { InstagramPost } from '../../instagram/models/instagram-post.entity'
import { InstagramUser } from '../../instagram/models/instagram-user.entity'
import { TiktokUser } from '../../tiktok/models/tiktok-user.entity'
import { TiktokVideo } from '../../tiktok/models/tiktok-video.entity'
import { TrackInstagramPost } from '../../track/models/track-instagram-post.entity'
import { TrackTiktokVideo } from '../../track/models/track-tiktok-video.entity'
import { TrackTwitCastingLive } from '../../track/models/track-twitcasting-live.entity'
import { TrackTwitchStream } from '../../track/models/track-twitch-stream.entity'
import { TrackTwitterProfile } from '../../track/models/track-twitter-profile.entity'
import { TrackTwitterSpace } from '../../track/models/track-twitter-space.entity'
import { TrackTwitterTweet } from '../../track/models/track-twitter-tweet.entity'
import { TwitCastingMovie } from '../../twitcasting/models/twitcasting-movie.entity'
import { TwitCastingUser } from '../../twitcasting/models/twitcasting-user.entity'
import { TwitchStream } from '../../twitch/models/twitch-stream.entity'
import { TwitchUser } from '../../twitch/models/twitch-user.entity'
import { TwitterFilteredStreamUser } from '../../twitter/models/twitter-filtered-stream-user.entity'
import { TwitterSpace } from '../../twitter/models/twitter-space.entity'
import { TwitterTweet } from '../../twitter/models/twitter-tweet.entity'
import { TwitterUser } from '../../twitter/models/twitter-user.entity'
import { YoutubeChannel } from '../../youtube/models/youtube-channel.entity'
import { YoutubeVideo } from '../../youtube/models/youtube-video.entity'

export const DB_ENTITIES = [
  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  DiscordMessage,

  TwitterFilteredStreamUser,
  TwitterUser,
  TwitterTweet,
  TwitterSpace,

  TwitCastingUser,
  TwitCastingMovie,

  YoutubeChannel,
  YoutubeVideo,

  TwitchUser,
  TwitchStream,

  InstagramUser,
  InstagramPost,

  TiktokUser,
  TiktokVideo,

  TrackTwitterTweet,
  TrackTwitterProfile,
  TrackTwitterSpace,
  TrackTwitCastingLive,
  TrackTwitchStream,
  TrackInstagramPost,
  TrackTiktokVideo,
]
