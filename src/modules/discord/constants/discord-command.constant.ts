import { GetCommand } from '../commands/get/get.command'
import { TrackAddCommand } from '../commands/track/track-add/track-add.command'
import { TrackRemoveCommand } from '../commands/track/track-remove/track-remove.command'

export const DISCORD_APP_COMMANDS = [
  TrackAddCommand,
  TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  // TrackAddCommand,
  // TrackRemoveCommand,
  GetCommand,
]

export const DISCORD_GLOBAL_COMMANDS = [
  // TrackAddCommand,
  // TrackRemoveCommand,
  // GetCommand,
]
