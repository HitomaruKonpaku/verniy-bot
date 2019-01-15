const { Command } = require('discord.js-commando')
const Discord = require('../../setting').Discord

module.exports = class BotInviteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      group: 'util',
      memberName: 'invite',
      description: 'Get bot invite link',
      guarded: true
    })
  }

  async run(msg) {
    const chunk = [
      [
        'Please contact',
        this.client.owners.map(v => `\`${v.tag}\``).join(', '),
        'for more detail about the bot.'
      ].join(' '),
      `<${Discord.InviteLink}>`
    ]
    const message = chunk.join('\n')
    return msg.say(message)
  }
}
