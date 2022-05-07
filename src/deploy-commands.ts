/* eslint-disable no-console */
/* eslint-disable no-debugger */
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import 'dotenv/config'
import { DISCORD_COMMANDS } from './modules/discord/constants/discord-command.constant'

const updateGuildCommands = true
const updateGlobalCommands = !true

const commands = DISCORD_COMMANDS
  .map((v) => v.command)
  .map((command) => command.toJSON())

const guildCommands = Array.from(commands)
const globalCommands = Array.from(commands)

// guildCommands.length = 0
globalCommands.length = 0

async function main() {
  const token = process.env.DISCORD_TOKEN
  const appId = process.env.DISCORD_APP_ID
  const guildId = process.env.DISCORD_GUILD_ID
  console.debug('token', token)
  console.debug('appId', appId)
  console.debug('guildId', guildId)

  if (!token) {
    console.error('Token not found')
    return
  }

  const rest = new REST({ version: '9' }).setToken(token)

  if (updateGuildCommands && appId && guildId) {
    try {
      await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: guildCommands })
      console.log('Successfully registered application guild commands')
    } catch (error) {
      console.error(error)
      debugger
    }
  }

  if (updateGlobalCommands && appId) {
    try {
      await rest.put(Routes.applicationCommands(appId), { body: globalCommands })
      console.log('Successfully registered application commands')
    } catch (error) {
      console.error(error)
      debugger
    }
  }
}

main()
