const { Command } = require('discord.js-commando')

module.exports = class KCAirPowerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'as',
      aliases: [],
      group: 'kc',
      memberName: 'as',
      description: 'AirPower of normal map'
    })
  }

  async run(msg) {
    const KC = AppConfig.KanColle
    const message = KC.AirPower
    return msg.say(message)
  }
}
