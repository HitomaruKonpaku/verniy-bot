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
    var seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds

    return hours + ":" + minutes + ":" + seconds
}