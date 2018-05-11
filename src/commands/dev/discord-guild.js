const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class DiscordGuildCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guild',
            group: 'dev',
            memberName: 'guild',
            description: '',
            guarded: true,
        })
    }

    async run(msg, args) {
        const prefix = n => {
            const prefix = '-'
            return Array(n).fill(prefix).join('')
        }
        const dateOptions = {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }
        const guilds = this.client.guilds.array()
        Logger.log(`Connected to ${guilds.length} guild${guilds.length > 1 ? 's' : ''}`)
        guilds.forEach(v => {
            Logger.log(`${prefix(1)} ${v.name}`)
            Logger.log(`${prefix(2)} Owner: ${v.owner.user.tag}`)
            Logger.log(`${prefix(2)} Joined At: ${Intl.DateTimeFormat('vn', dateOptions).format(v.joinedAt)}`)
            Logger.log(`${prefix(2)} Members: ${v.memberCount}`)
            Logger.log(`${prefix(2)} Bots: ${v.members.filterArray(v => v.user.bot).length}`)
        })
    }
}