const { Command } = require('discord.js-commando')

const MESSAGE = 'GoodAfternoon /'

module.exports = class GoodAfternoonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ga',
      group: 'fun',
      memberName: 'ga',
      description: MESSAGE
    })
  }

  async run(msg) {
    return msg.say(MESSAGE)
  }
}
