import { GetTwitCastingMovieCommand } from '../commands/get/get-twitcasting/get-twitcasting-movie.command'
import { GetTwitCastingMoviesByUserCommand } from '../commands/get/get-twitcasting/get-twitcasting-movies-by-user.command'
import { GetTwitCastingUserCommand } from '../commands/get/get-twitcasting/get-twitcasting-user.command'
import { GetTwitCastingCommand } from '../commands/get/get-twitcasting/get-twitcasting.command'
import { GetTwitterSpaceCommand } from '../commands/get/get-twitter/get-twitter-space.command'
import { GetTwitterUserCommand } from '../commands/get/get-twitter/get-twitter-user.command'
import { GetTwitterCommand } from '../commands/get/get-twitter/get-twitter.command'
import { GetCommand } from '../commands/get/get.command'
import { StatusCommand } from '../commands/status/status.command'
import { TrackAddCommand } from '../commands/track/track-add.command'
import { TrackAddInstagramPostCommand } from '../commands/track/track-add/track-add-instagram-post.command'
import { TrackAddInstagramProfileCommand } from '../commands/track/track-add/track-add-instagram-profile.command'
import { TrackAddInstagramStoryCommand } from '../commands/track/track-add/track-add-instagram-story.command'
import { TrackAddTiktokVideoCommand } from '../commands/track/track-add/track-add-tiktok-video.command'
import { TrackAddTwitCastingLiveCommand } from '../commands/track/track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchChatCommand } from '../commands/track/track-add/track-add-twitch-chat.command'
import { TrackAddTwitchLiveCommand } from '../commands/track/track-add/track-add-twitch-live.command'
import { TrackAddTwitterProfileCommand } from '../commands/track/track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from '../commands/track/track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from '../commands/track/track-add/track-add-twitter-tweet.command'
import { TrackAddYoutubeLiveCommand } from '../commands/track/track-add/track-add-youtube-live.command'
import { TrackRemoveCommand } from '../commands/track/track-remove.command'
import { TrackRemoveInstagramPostCommand } from '../commands/track/track-remove/track-remove-instagram-post.command'
import { TrackRemoveInstagramProfileCommand } from '../commands/track/track-remove/track-remove-instagram-profile.command'
import { TrackRemoveInstagramStoryCommand } from '../commands/track/track-remove/track-remove-instagram-story.command'
import { TrackRemoveTiktokVideoCommand } from '../commands/track/track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from '../commands/track/track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchChatCommand } from '../commands/track/track-remove/track-remove-twitch-chat.command'
import { TrackRemoveTwitchLiveCommand } from '../commands/track/track-remove/track-remove-twitch-live.command'
import { TrackRemoveTwitterProfileCommand } from '../commands/track/track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from '../commands/track/track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from '../commands/track/track-remove/track-remove-twitter-tweet.command'
import { TrackRemoveYoutubeLiveCommand } from '../commands/track/track-remove/track-remove-youtube-live.command'

export const DISCORD_APP_COMMANDS = [
  StatusCommand,
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  // StatusCommand,
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]

export const DISCORD_GLOBAL_COMMANDS = [
  // StatusCommand,
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]

export const DISCORD_ALL_COMMANDS = [
  // admin

  // status
  StatusCommand,

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
]
