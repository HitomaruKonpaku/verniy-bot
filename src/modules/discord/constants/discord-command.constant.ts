import { ConfigCommand } from '../commands/config/config.command'
import { GetCommand } from '../commands/get/get.command'
import { StatusCommand } from '../commands/status/status.command'
import { TrackAddCommand } from '../commands/track/track-add.command'
import { TrackAddInstagramPostCommand } from '../commands/track/track-add/track-add-instagram-post.command'
import { TrackAddInstagramProfileCommand } from '../commands/track/track-add/track-add-instagram-profile.command'
import { TrackAddInstagramStoryCommand } from '../commands/track/track-add/track-add-instagram-story.command'
import { TrackAddTiktokVideoCommand } from '../commands/track/track-add/track-add-tiktok-video.command'
import { TrackAddTwitCastingLiveCommand } from '../commands/track/track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchLiveCommand } from '../commands/track/track-add/track-add-twitch-live.command'
import { TrackAddTwitterProfileCommand } from '../commands/track/track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from '../commands/track/track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from '../commands/track/track-add/track-add-twitter-tweet.command'
import { TrackRemoveCommand } from '../commands/track/track-remove.command'
import { TrackRemoveInstagramPostCommand } from '../commands/track/track-remove/track-remove-instagram-post.command'
import { TrackRemoveInstagramProfileCommand } from '../commands/track/track-remove/track-remove-instagram-profile.command'
import { TrackRemoveInstagramStoryCommand } from '../commands/track/track-remove/track-remove-instagram-story.command'
import { TrackRemoveTiktokVideoCommand } from '../commands/track/track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from '../commands/track/track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchLiveCommand } from '../commands/track/track-remove/track-remove-twitch-live.command'
import { TrackRemoveTwitterProfileCommand } from '../commands/track/track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from '../commands/track/track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from '../commands/track/track-remove/track-remove-twitter-tweet.command'

export const DISCORD_APP_COMMANDS = [
  StatusCommand,
  ConfigCommand,
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  // StatusCommand,
  // ConfigCommand,
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
  // status
  StatusCommand,

  // config
  ConfigCommand,

  // track-add
  TrackAddCommand,
  TrackAddTwitterTweetCommand,
  TrackAddTwitterProfileCommand,
  TrackAddTwitterSpaceCommand,
  TrackAddTwitCastingLiveCommand,
  TrackAddTwitchLiveCommand,
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
  TrackRemoveTwitchLiveCommand,
  TrackRemoveInstagramPostCommand,
  TrackRemoveInstagramStoryCommand,
  TrackRemoveInstagramProfileCommand,
  TrackRemoveTiktokVideoCommand,

  // get
  GetCommand,
]
