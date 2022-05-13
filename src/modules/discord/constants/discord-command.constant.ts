import { GetCommand } from '../commands/get.command'
import { TrackCommand } from '../commands/track.command'
import { UntrackCommand } from '../commands/untrack.command'

export const DISCORD_APP_COMMANDS = [
  TrackCommand,
  UntrackCommand,
  GetCommand,
]

export const DISCORD_GUILD_COMMANDS = [
  // TrackCommand,
  // UntrackCommand,
  GetCommand,
]

export const DISCORD_GLOBAL_COMMANDS = [
  // TrackCommand,
  // UntrackCommand,
  // GetCommand,
]
