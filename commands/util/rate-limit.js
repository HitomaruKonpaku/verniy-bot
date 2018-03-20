const { Command } = require('discord.js-commando')
const Twitter = require('../../modules/twitter-follow')

module.exports = class TwitterRateLimitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'limit',
            group: 'util',
            memberName: 'limit',
            description: '',
        })
    }

    async run(msg, args) {
        Twitter.rateLimit().then(data => {
            msg.channel.send(data)
        })
    }
}