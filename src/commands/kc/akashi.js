const { Command } = require('discord.js-commando')

module.exports = class KCAkashiCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'akashi',
      aliases: [],
      group: 'kc',
      memberName: 'akashi',
      description: 'Akashi List'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.Akashi
    return msg.say(message)
  }
}
