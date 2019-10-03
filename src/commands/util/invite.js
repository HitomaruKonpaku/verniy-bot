const { Command } = require('discord.js-commando')

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
      `<https://discordapp.com/oauth2/authorize?scope=bot&client_id=${this.client.user.id}>`
    ]
    const message = chunk.join('\n')
    return msg.say(message)
  }
}
