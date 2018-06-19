const { Command } = require('discord.js-commando')
const Settings = require('../../settings')
const Logger = require('../../modules/Logger')

module.exports = class DiscordGuildCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guild',
            group: 'dev',
            memberName: 'guild',
            description: '',
        })
    }

    async run(msg) {
        const prefix = (length, prefix = '-') => {
            return Array(length).fill(prefix).join('')
        }
        const guilds = this.client.guilds.array()
        Logger.log(`Connected to ${guilds.length} guild${guilds.length > 1 ? 's' : ''}`)
        guilds.forEach(v => {
            Logger.log(`${prefix(1, '>')} ${v.name}`)
            Logger.log(`${prefix(2)} Owner: ${v.owner.user.tag}`)
            Logger.log(`${prefix(2)} Joined At: ${new Date(v.joinedAt).toCustomString(Settings.Global.TimezoneOffset)}`)
            Logger.log(`${prefix(2)} Members: ${v.memberCount}`)
            Logger.log(`${prefix(2)} Bots: ${v.members.filterArray(v => v.user.bot).length}`)
        })
    }
}