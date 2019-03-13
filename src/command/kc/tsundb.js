const { Command } = require('discord.js-commando')
const KC = require('../../setting').KanColle

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
    const message = KC.TsunDB
    return msg.say(message)
  }
}
