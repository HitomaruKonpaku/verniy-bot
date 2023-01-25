import { ClientOptions, GatewayIntentBits } from 'discord.js'

export const DISCORD_CLIENT_OPTIONS: ClientOptions = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
}
