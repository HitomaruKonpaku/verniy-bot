const { Command } = require('discord.js-commando')

module.exports = class KCTouchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'touch',
      aliases: [],
      group: 'kc',
      memberName: 'touch',
      description: 'Special attack info'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.SpecialAttack
    return msg.say(message)
  }
}
