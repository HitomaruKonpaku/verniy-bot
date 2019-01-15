const { Command } = require('discord.js-commando')

const MESSAGE = 'ｽﾞｲ₍₍(ง˘ω˘)ว⁾⁾ｽﾞｲ'

module.exports = class KCZuiCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'zui',
      aliases: [],
      group: 'kc',
      memberName: 'zui',
      description: MESSAGE
    })
  }

  async run(msg) {
    return msg.say(MESSAGE)
  }
}
