const { Command } = require('discord.js-commando')

const ConfigVar = require('../../module/ConfigVar')
const Util = require('../../module/Util')

module.exports = class MailCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mail',
      group: 'dev',
      memberName: 'mail',
      description: ''
    })
  }

  async run(msg, args) {
    //
    const isOwner = this.client.isOwner(msg.author)
    if (!isOwner) return
    if (!args || args.trim() === '') return
    //
    try {
      const res = await msg.say('Sending...')
      await Util.sendEmail({
        email: ConfigVar.APP_OWNER_EMAIL_ADDRESS,
        subject: 'TEST EMAIL',
        content: args.trim()
      })
      await res.edit('Send!')
    } catch (err) {
      // Ignore
    }
  }
}
