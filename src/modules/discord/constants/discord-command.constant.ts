import { ConfigCommand } from '../commands/config/config.command'
import { GetCommand } from '../commands/get/get.command'
import { TrackAddCommand } from '../commands/track/track-add.command'
import { TrackAddInstagramPostCommand } from '../commands/track/track-add/track-add-instagram-post.command'
import { TrackAddTiktokVideoCommand } from '../commands/track/track-add/track-add-tiktok-video.command'
import { TrackAddTwitCastingLiveCommand } from '../commands/track/track-add/track-add-twitcasting-live.command'
import { TrackAddTwitchUserStreamCommand } from '../commands/track/track-add/track-add-twitch-user-stream.command'
import { TrackAddTwitterProfileCommand } from '../commands/track/track-add/track-add-twitter-profile.command'
import { TrackAddTwitterSpaceCommand } from '../commands/track/track-add/track-add-twitter-space.command'
import { TrackAddTwitterTweetCommand } from '../commands/track/track-add/track-add-twitter-tweet.command'
import { TrackRemoveCommand } from '../commands/track/track-remove.command'
import { TrackRemoveInstagramPostCommand } from '../commands/track/track-remove/track-remove-instagram-post.command'
import { TrackRemoveTiktokVideoCommand } from '../commands/track/track-remove/track-remove-tiktok-video.command'
import { TrackRemoveTwitCastingLiveCommand } from '../commands/track/track-remove/track-remove-twitcasting-live.command'
import { TrackRemoveTwitchUserStreamCommand } from '../commands/track/track-remove/track-remove-twitch-user-stream.command'
import { TrackRemoveTwitterProfileCommand } from '../commands/track/track-remove/track-remove-twitter-profile.command'
import { TrackRemoveTwitterSpaceCommand } from '../commands/track/track-remove/track-remove-twitter-space.command'
import { TrackRemoveTwitterTweetCommand } from '../commands/track/track-remove/track-remove-twitter-tweet.command'

export const DISCORD_APP_COMMANDS = [
  ConfigCommand,
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  // ConfigCommand,
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]

export const DISCORD_GLOBAL_COMMANDS = [
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]

export const DISCORD_ALL_COMMANDS = [
  // config
  ConfigCommand,

  // track-add
  TrackAddCommand,
  TrackAddTwitterTweetCommand,
  TrackAddTwitterProfileCommand,
  TrackAddTwitterSpaceCommand,
  TrackAddTwitCastingLiveCommand,
  TrackAddTwitchUserStreamCommand,
  TrackAddInstagramPostCommand,
  TrackAddTiktokVideoCommand,

  // track-remove
  TrackRemoveCommand,
  TrackRemoveTwitterTweetCommand,
  TrackRemoveTwitterProfileCommand,
  TrackRemoveTwitterSpaceCommand,
  TrackRemoveTwitCastingLiveCommand,
  TrackRemoveTwitchUserStreamCommand,
  TrackRemoveInstagramPostCommand,
  TrackRemoveTiktokVideoCommand,

  // get
  GetCommand,
]
