import { ConfigVar } from '../../config-var/model/config-var.entity'
import { DiscordChannel } from '../../discord/model/discord-channel.entity'
import { DiscordGuild } from '../../discord/model/discord-guild.entity'
import { DiscordMessage } from '../../discord/model/discord-message.entity'
import { DiscordUser } from '../../discord/model/discord-user.entity'
import { History } from '../../history/model/history.entity'
import { HolodexChannel } from '../../holodex/model/holodex-channel.entity'
import { HolodexChannelAccount } from '../../holodex/model/holodex-channel_account.entity'
import { HolodexExternalStream } from '../../holodex/model/holodex-external-stream.entity'
import { HolodexVideo } from '../../holodex/model/holodex-video.entity'
import { InstagramPost } from '../../instagram/model/instagram-post.entity'
import { InstagramStory } from '../../instagram/model/instagram-story.entity'
import { InstagramUser } from '../../instagram/model/instagram-user.entity'
import { TiktokUser } from '../../tiktok/model/tiktok-user.entity'
import { TiktokVideo } from '../../tiktok/model/tiktok-video.entity'
import { Track } from '../../track/model/base/track.entity'
import { TrackInstagramPost } from '../../track/model/track-instagram-post.entity'
import { TrackInstagramProfile } from '../../track/model/track-instagram-profile.entity'
import { TrackInstagramStory } from '../../track/model/track-instagram-story.entity'
import { TrackTiktokVideo } from '../../track/model/track-tiktok-video.entity'
import { TrackTwitCastingLive } from '../../track/model/track-twitcasting-live.entity'
import { TrackTwitchChat } from '../../track/model/track-twitch-chat.entity'
import { TrackTwitchLive } from '../../track/model/track-twitch-live.entity'
import { TrackTwitterProfile } from '../../track/model/track-twitter-profile.entity'
import { TrackTwitterSpace } from '../../track/model/track-twitter-space.entity'
import { TrackTwitterTweet } from '../../track/model/track-twitter-tweet.entity'
import { TrackUser } from '../../track/model/track-user.entity'
import { TrackYoutubeLive } from '../../track/model/track-youtube-live.entity'
import { TwitCastingMovie } from '../../twitcasting/model/twitcasting-movie.entity'
import { TwitCastingUser } from '../../twitcasting/model/twitcasting-user.entity'
import { TwitchGame } from '../../twitch/model/twitch-game.entity'
import { TwitchStream } from '../../twitch/model/twitch-stream.entity'
import { TwitchUser } from '../../twitch/model/twitch-user.entity'
import { TwitterBroadcast } from '../../twitter/model/twitter-broadcast.entity'
import { TwitterFilteredStreamUser } from '../../twitter/model/twitter-filtered-stream-user.entity'
import { TwitterSpace } from '../../twitter/model/twitter-space.entity'
import { TwitterTweet } from '../../twitter/model/twitter-tweet.entity'
import { TwitterUser } from '../../twitter/model/twitter-user.entity'
import { VtuberAccount } from '../../vtuber/model/vtuber-account.entity'
import { VtuberGroupMember } from '../../vtuber/model/vtuber-group-member.entity'
import { VtuberGroup } from '../../vtuber/model/vtuber-group.entity'
import { VtuberOrg } from '../../vtuber/model/vtuber-org.entity'
import { VtuberUser } from '../../vtuber/model/vtuber-user.entity'
import { YoutubeChannel } from '../../youtube/model/youtube-channel.entity'
import { YoutubePlaylistItem } from '../../youtube/model/youtube-playlist-item.entity'
import { YoutubePlaylist } from '../../youtube/model/youtube-playlist.entity'
import { YoutubePost } from '../../youtube/model/youtube-post.entity'
import { YoutubeVideo } from '../../youtube/model/youtube-video.entity'

export const DB_ENTITIES = [
  ConfigVar,

  History,

  DiscordUser,
  DiscordGuild,
  DiscordChannel,
  DiscordMessage,

  TwitterFilteredStreamUser,
  TwitterUser,
  TwitterTweet,
  TwitterSpace,
  TwitterBroadcast,

  TwitCastingUser,
  TwitCastingMovie,

  YoutubeChannel,
  YoutubeVideo,
  YoutubePlaylist,
  YoutubePlaylistItem,
  YoutubePost,

  TwitchUser,
  TwitchStream,
  TwitchGame,

  InstagramUser,
  InstagramPost,
  InstagramStory,

  TiktokUser,
  TiktokVideo,

  HolodexChannel,
  HolodexChannelAccount,
  HolodexVideo,
  HolodexExternalStream,

  Track,
  TrackTwitterTweet,
  TrackTwitterProfile,
  TrackTwitterSpace,
  TrackTwitCastingLive,
  TrackYoutubeLive,
  TrackTwitchLive,
  TrackTwitchChat,
  TrackInstagramProfile,
  TrackInstagramPost,
  TrackInstagramStory,
  TrackTiktokVideo,

  TrackUser,

  VtuberUser,
  VtuberAccount,
  VtuberOrg,
  VtuberGroup,
  VtuberGroupMember,
]
