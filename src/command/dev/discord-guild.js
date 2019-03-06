const { Command } = require('discord.js-commando')
const Logger = require('../../module/Logger')

module.exports = class DiscordGuildCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'guild',
      group: 'dev',
      memberName: 'guild',
      description: ''
    })
  }

  async run() {
    const prefix = (length, prefix = '-') => Array(length).fill(prefix).join('')
    const guilds = this.client.guilds.array()
    Logger.log(`Connected to ${guilds.length} guild${guilds.length > 1 ? 's' : ''}`)
    guilds
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
      .forEach(v => {
        if (!v.available) return
        Logger.log(`${prefix(1, '>')} ${v.name}`)
        Logger.log(`${prefix(2)} Owner: ${v.owner.user.tag}`)
        Logger.log(`${prefix(2)} Joined At: ${new Date(v.joinedAt).toCustomString()}`)
        Logger.log(`${prefix(2)} Members: ${v.memberCount}; Bots: ${v.members.filter(v => v.user.bot)._array.length}`)
      })
  }
}
