const { Command } = require('discord.js-commando')

module.exports = class KCDevelopmentCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'development',
      aliases: ['dev'],
      group: 'kc',
      memberName: 'development',
      description: 'Development quick guide'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.Development
    return msg.say(message)
  }
}
