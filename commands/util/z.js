const { Command } = require('discord.js-commando')
const db = require('../../lib/db')

module.exports = class ZCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'z',
            group: 'test',
            memberName: 'z',
            description: '',
            argsType: 'single',
            args: [{
                key: 'prefix',
                prompt: 'What would you like to set the bot\'s prefix to?',
                type: 'string',
                min: 1,
                max: 10,
                default: ''
            }],
            wait: 15,
        })
    }

    async run(msg, args) {
        let uid = msg.author.id,
            gid = msg.guild ? msg.guild.id : undefined,
            prefix = args.prefix
        if (!prefix) {
            let prefix = db.getGuildPrefix(gid) || db.getUserPrefix(uid)
            msg.channel.send(prefix ? prefix : 'Prefix not found.')
        } else {
            gid ? db.setGuildPrefix(gid, prefix) : db.setUserPrefix(uid, prefix)
        }
    }
}