const { Command } = require('discord.js-commando')

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ping',
            group: 'util',
            memberName: 'ping',
            description: 'Checks the bot\'s ping to the Discord server.',
            throttling: {
                usages: 5,
                duration: 10,
            },
        })
    }

    async run(msg) {
        const msgPing = '**Pinging...**'
        const pingMsg = await msg.say(msgPing)
        const msgPong = [
            '**Pong!**',
            `The message round-trip took **${pingMsg.createdTimestamp - msg.createdTimestamp}ms**.`,
            this.client.ping ? `The heartbeat ping is **${Math.round(this.client.ping)}ms**.` : '',
        ].join(' ').trim()
        return pingMsg.edit(msgPong)
    }
}