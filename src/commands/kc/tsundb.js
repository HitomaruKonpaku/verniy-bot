const { Command } = require('discord.js-commando')

module.exports = class KCTsunDBCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'tsundb',
      aliases: ['tsun'],
      group: 'kc',
      memberName: 'tsundb',
      description: 'TsunDB'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.TsunDB
    return msg.say(message)
  }
}
