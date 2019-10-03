const logger = require('log4js').getLogger('Discord')
const Commando = require('discord.js-commando')
const path = require('path')

class Discord {

  constructor() {
    logger.info('Constructor')
    // Config
    const client = new Commando.CommandoClient({
      owner: (AppConst.DISCORD_OWNERS || '153363129915539457').split(','),
      commandPrefix: '.',
      unknownCommandResponse: false
    })
    // Events
    client.on('debug', require('./events/discord/on.debug'))
    client.on('warn', require('./events/discord/on.warn'))
    client.on('error', require('./events/discord/on.error'))
    client.on('ready', require('./events/discord/on.ready'))
    client.once('ready', require('./events/discord/once.ready')(client))
    client.on('disconnect', require('./events/discord/on.disconnect'))
    client.on('reconnecting', require('./events/discord/on.reconnecting'))
    client.on('message', require('./events/discord/on.message'))
    client.on('guildUnavailable', require('./events/discord/on.guildUnavailable'))
    client.on('guildCreate', require('./events/discord/on.guildCreate'))
    client.on('guildDelete', require('./events/discord/on.guildDelete'))
    client.on('commandRun', require('./events/discord/on.commandRun'))
    // Registry
    client.registry
      .registerDefaultTypes()
      .registerGroups([
        ['admin', 'Admin'],
        ['util', 'Utility'],
        ['user', 'User'],
        ['kc', 'KanColle'],
        ['fun', 'Fun']
      ])
      .registerCommandsIn(path.join(__dirname, '../commands'))
    // Assign class vars
    this.client = client
  }

  async login() {
    try {
      await this.client.login(AppConst.DISCORD_TOKEN)
    } catch (err) {
      logger.error(err)
    }
  }

}

module.exports = new Discord()
