const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

module.exports = class UpTimeCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'uptime',
            group: 'util',
            memberName: 'uptime',
            description: 'Checks the bot\'s uptime.',
        })
    }

    async run(msg) {
        let r = this.client.readyAt,
            t = this.client.uptime

        msg.embed(
            new RichEmbed({ color: 0x43b581 })
            .addField('Ready At', r)
            .addField('Uptime', msToTime(t))
        )
    }
}

function msToTime(duration) {
    let seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24),
        days = parseInt((duration / (1000 * 60 * 60 * 24)))

    return [days, hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':')
}