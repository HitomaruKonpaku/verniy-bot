import { ClientOptions, Intents } from 'discord.js'

export const DISCORD_CLIENT_OPTIONS: ClientOptions = {
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
}
