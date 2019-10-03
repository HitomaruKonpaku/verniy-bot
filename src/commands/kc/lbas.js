const { Command } = require('discord.js-commando')

module.exports = class KCLbasCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lbas',
      aliases: ['lb'],
      group: 'kc',
      memberName: 'lbas',
      description: 'Land Base Aerial Support'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.LBAS
    return msg.say(message)
  }
}
