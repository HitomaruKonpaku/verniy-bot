const Commando = require('discord.js-commando')
const path = require('path')

const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')
const Helper = require('./DiscordHelper')

class DiscordClient {

  constructor() {
    Logger.log('DISCORD constructor')
    //
    this.client = new Commando.Client({
      owner: ConfigVar.DISCORD_OWNER.split(','),
      commandPrefix: ConfigVar.DISCORD_COMMAND_PREFIX,
      commandEditableDuration: ConfigVar.DISCORD_COMMAND_EDITABLE_DURATION,
      nonCommandEditable: ConfigVar.DISCORD_NON_COMMAND_EDITABLE,
      unknownCommandResponse: ConfigVar.DISCORD_UNKNOWN_COMMAND_RESPONSE
    })
    //
    this.client.on('ready', Helper.onReady)
    this.client.on('reconnecting', Helper.onReconnecting)
    this.client.on('debug', Helper.onDebug)
    this.client.on('warn', Helper.onWarn)
    this.client.on('error', Helper.onError)
    this.client.on('resume', Helper.onResume)
    this.client.on('disconnect', Helper.onDisconnect)
    this.client.on('message', Helper.onMessage)
    this.client.on('guildCreate', Helper.onGuildCreate)
    this.client.on('guildDelete', Helper.onGuildDelete)
    this.client.on('guildUnavailable', Helper.onGuildUnavailable)
    //
    this.client.registry
      .registerDefaultTypes()
      .registerGroups(Helper.getRegisterGroups())
      .registerCommandsIn(path.join(__dirname, '../command'))
  }

  async start() {
    const token = ConfigVar.DISCORD_TOKEN
    if (!token) {
      Logger.error('DISCORD_TOKEN not found')
      return
    }
    try {
      await this.client.login(token)
      await Helper.onceReady(this.client)
    } catch (err) {
      Logger.error(err)
    }
  }

}

module.exports = new DiscordClient()
