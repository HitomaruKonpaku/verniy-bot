import { DiscordChannel } from '../../discord/models/discord-channel.entity'
import { DiscordGuild } from '../../discord/models/discord-guild.entity'
import { DiscordMessage } from '../../discord/models/discord-message.entity'
import { DiscordUser } from '../../discord/models/discord-user.entity'
import { InstagramPost } from '../../instagram/models/instagram-post.entity'
import { InstagramStory } from '../../instagram/models/instagram-story.entity'
import { InstagramUser } from '../../instagram/models/instagram-user.entity'
import { OrganizationGroupMember } from '../../organization/models/organization-group-member.entity'
import { OrganizationGroup } from '../../organization/models/organization-group.entity'
import { OrganizationMember } from '../../organization/models/organization-member.entity'
import { Organization } from '../../organization/models/organization.entity'
import { TiktokUser } from '../../tiktok/models/tiktok-user.entity'
import { TiktokVideo } from '../../tiktok/models/tiktok-video.entity'
import { Track } from '../../track/models/base/track.entity'
import { TrackInstagramPost } from '../../track/models/track-instagram-post.entity'
import { TrackInstagramProfile } from '../../track/models/track-instagram-profile.entity'
import { TrackInstagramStory } from '../../track/models/track-instagram-story.entity'
import { TrackTiktokVideo } from '../../track/models/track-tiktok-video.entity'
import { TrackTwitCastingLive } from '../../track/models/track-twitcasting-live.entity'
import { TrackTwitchChat } from '../../track/models/track-twitch-chat.entity'
import { TrackTwitchLive } from '../../track/models/track-twitch-live.entity'
import { TrackTwitterProfile } from '../../track/models/track-twitter-profile.entity'
import { TrackTwitterSpace } from '../../track/models/track-twitter-space.entity'
import { TrackTwitterTweet } from '../../track/models/track-twitter-tweet.entity'
import { TrackYoutubeLive } from '../../track/models/track-youtube-live.entity'
import { TwitCastingMovie } from '../../twitcasting/models/twitcasting-movie.entity'
import { TwitCastingUser } from '../../twitcasting/models/twitcasting-user.entity'
import { TwitchGame } from '../../twitch/models/twitch-game.entity'
import { TwitchStream } from '../../twitch/models/twitch-stream.entity'
import { TwitchUser } from '../../twitch/models/twitch-user.entity'
import { TwitterFilteredStreamUser } from '../../twitter/models/twitter-filtered-stream-user.entity'
import { TwitterSpace } from '../../twitter/models/twitter-space.entity'
import { TwitterTweet } from '../../twitter/models/twitter-tweet.entity'
import { TwitterUser } from '../../twitter/models/twitter-user.entity'
import { YoutubeChannel } from '../../youtube/model/youtube-channel.entity'
import { YoutubePlaylistItem } from '../../youtube/model/youtube-playlist-item.entity'
import { YoutubePlaylist } from '../../youtube/model/youtube-playlist.entity'
import { YoutubeVideo } from '../../youtube/model/youtube-video.entity'

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
  YoutubePlaylist,
  YoutubePlaylistItem,

  TwitchUser,
  TwitchStream,
  TwitchGame,

  InstagramUser,
  InstagramPost,
  InstagramStory,

  TiktokUser,
  TiktokVideo,

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

  Organization,
  OrganizationGroup,
  OrganizationMember,
  OrganizationGroupMember,
]
