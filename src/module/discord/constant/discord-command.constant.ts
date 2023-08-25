import { AdminReloadConfigCommand } from '../command/admin/admin-reload/admin-reload-config.command'
import { AdminReloadEnvironmentCommand } from '../command/admin/admin-reload/admin-reload-environment.command'
import { AdminReloadTwitterStreamRulesCommand } from '../command/admin/admin-reload/admin-reload-twitter-stream-rules.command'
import { AdminReloadCommand } from '../command/admin/admin-reload/admin-reload.command'
import { AdminCommand } from '../command/admin/admin.command'
import { ConfigVarGetCommand } from '../command/config-var/config-var-get.command'
import { ConfigVarListCommand } from '../command/config-var/config-var-list.command'
import { ConfigVarSetCommand } from '../command/config-var/config-var-set.command'
import { ConfigVarCommand } from '../command/config-var/config-var.command'
import { GetTwitCastingMovieCommand } from '../command/get/get-twitcasting/get-twitcasting-movie.command'
import { GetTwitCastingMoviesByUserCommand } from '../command/get/get-twitcasting/get-twitcasting-movies-by-user.command'
import { GetTwitCastingUserCommand } from '../command/get/get-twitcasting/get-twitcasting-user.command'
import { GetTwitCastingCommand } from '../command/get/get-twitcasting/get-twitcasting.command'
import { GetTwitchUserCommand } from '../command/get/get-twitch/get-twitch-user.command'
import { GetTwitchCommand } from '../command/get/get-twitch/get-twitch.command'
import { GetTwitterSpaceCommand } from '../command/get/get-twitter/get-twitter-space.command'
import { GetTwitterUserCommand } from '../command/get/get-twitter/get-twitter-user.command'
import { GetTwitterCommand } from '../command/get/get-twitter/get-twitter.command'
import { GetYoutubeChannelCommand } from '../command/get/get-youtube/get-youtube-channel.command'
import { GetYoutubeCommand } from '../command/get/get-youtube/get-youtube.command'
import { GetCommand } from '../command/get/get.command'
import { StatusCommand } from '../command/status/status.command'
import { TrackAddCommand } from '../command/track/track-add.command'
import { TrackAddInstagramPostCommand } from '../command/track/track-add/track-add-instagram-post.command'
import { TrackAddInstagramProfileCommand } from '../command/track/track-add/track-add-instagram-profile.command'
import { TrackAddInstagramStoryCommand } from '../command/track/track-add/track-add-instagram-story.command'
import { TrackAddTiktokVideoCommand } from '../command/track/track-add/track-add-tiktok-video.command'
import { TrackAddTwitCastingLiveCommand } from '../command/track/track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchChatCommand } from '../command/track/track-add/track-add-twitch-chat.command'
import { TrackAddTwitchLiveCommand } from '../command/track/track-add/track-add-twitch-live.command'
import { TrackAddTwitterProfileCommand } from '../command/track/track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from '../command/track/track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from '../command/track/track-add/track-add-twitter-tweet.command'
import { TrackAddYoutubeLiveCommand } from '../command/track/track-add/track-add-youtube-live.command'
import { TrackListCommand } from '../command/track/track-list.command'
import { TrackRemoveCommand } from '../command/track/track-remove.command'
import { TrackRemoveInstagramPostCommand } from '../command/track/track-remove/track-remove-instagram-post.command'
import { TrackRemoveInstagramProfileCommand } from '../command/track/track-remove/track-remove-instagram-profile.command'
import { TrackRemoveInstagramStoryCommand } from '../command/track/track-remove/track-remove-instagram-story.command'
import { TrackRemoveTiktokVideoCommand } from '../command/track/track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from '../command/track/track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchChatCommand } from '../command/track/track-remove/track-remove-twitch-chat.command'
import { TrackRemoveTwitchLiveCommand } from '../command/track/track-remove/track-remove-twitch-live.command'
import { TrackRemoveTwitterProfileCommand } from '../command/track/track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from '../command/track/track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from '../command/track/track-remove/track-remove-twitter-tweet.command'
import { TrackRemoveYoutubeLiveCommand } from '../command/track/track-remove/track-remove-youtube-live.command'
import { UpdateTwitterSpaceDataCommand } from '../command/update/update-twitter/update-twitter-space-data.command'
import { UpdateTwitterSpacePlaylistUrlCommand } from '../command/update/update-twitter/update-twitter-space-playlist-url.command'
import { UpdateTwitterSpaceStatsCommand } from '../command/update/update-twitter/update-twitter-space-stats.command'
import { UpdateTwitterCommand } from '../command/update/update-twitter/update-twitter.command'
import { UpdateYoutubeChannelCommand } from '../command/update/update-youtube/update-youtube-channel.command'
import { UpdateYoutubeCommand } from '../command/update/update-youtube/update-youtube.command'
import { UpdateCommand } from '../command/update/update.command'

export const DISCORD_APP_COMMANDS = [
  ConfigVarCommand,
  AdminCommand,
  UpdateCommand,

  StatusCommand,
  TrackListCommand,
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  ConfigVarCommand,
  // AdminCommand,
  // UpdateCommand,

  // StatusCommand,
  // TrackListCommand,
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]

export const DISCORD_GLOBAL_COMMANDS = [
  StatusCommand,
  TrackListCommand,
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_ALL_COMMANDS = [
  // config-var
  ConfigVarCommand,
  ConfigVarListCommand,
  ConfigVarGetCommand,
  ConfigVarSetCommand,

  // admin
  AdminCommand,
  AdminReloadCommand,
  AdminReloadEnvironmentCommand,
  AdminReloadConfigCommand,
  AdminReloadTwitterStreamRulesCommand,

  // update
  UpdateCommand,
  UpdateTwitterCommand,
  UpdateTwitterSpaceDataCommand,
  UpdateTwitterSpaceStatsCommand,
  UpdateTwitterSpacePlaylistUrlCommand,
  UpdateYoutubeCommand,
  UpdateYoutubeChannelCommand,

  // status
  StatusCommand,

  // track-list
  TrackListCommand,

  // track-add
  TrackAddCommand,
  TrackAddTwitterTweetCommand,
  TrackAddTwitterProfileCommand,
  TrackAddTwitterSpaceCommand,
  TrackAddTwitCastingLiveCommand,
  TrackAddYoutubeLiveCommand,
  TrackAddTwitchLiveCommand,
  TrackAddTwitchChatCommand,
  TrackAddInstagramPostCommand,
  TrackAddInstagramStoryCommand,
  TrackAddInstagramProfileCommand,
  TrackAddTiktokVideoCommand,

  // track-remove
  TrackRemoveCommand,
  TrackRemoveTwitterTweetCommand,
  TrackRemoveTwitterProfileCommand,
  TrackRemoveTwitterSpaceCommand,
  TrackRemoveTwitCastingLiveCommand,
  TrackRemoveYoutubeLiveCommand,
  TrackRemoveTwitchLiveCommand,
  TrackRemoveTwitchChatCommand,
  TrackRemoveInstagramPostCommand,
  TrackRemoveInstagramStoryCommand,
  TrackRemoveInstagramProfileCommand,
  TrackRemoveTiktokVideoCommand,

  // get
  GetCommand,
  GetTwitterCommand,
  GetTwitterUserCommand,
  GetTwitterSpaceCommand,
  GetTwitCastingCommand,
  GetTwitCastingUserCommand,
  GetTwitCastingMovieCommand,
  GetTwitCastingMoviesByUserCommand,
  GetYoutubeCommand,
  GetYoutubeChannelCommand,
  GetTwitchCommand,
  GetTwitchUserCommand,
]
