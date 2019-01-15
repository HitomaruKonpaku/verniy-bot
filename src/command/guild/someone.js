const { Command } = require('discord.js-commando')

module.exports = class SomeoneCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'someone',
      group: 'guild',
      memberName: 'someone',
      description: 'Get random user in current guild',
      guildOnly: true
    })
  }

  async run(msg) {
    const members = msg.channel.members.random(1)
    const name = members[0].displayName
    const message = this.message(name)
    return msg.say(message)
  }

  message(data) {
    return `:arrow_right: ${data}`
  }
}
