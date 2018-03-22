const { Command } = require('discord.js-commando')
const Twitter = require('../../modules/twitter-api')

module.exports = class TwitterRateLimitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'trl',
            group: 'dev',
            memberName: 'trl',
            description: 'Twitter rate limit',
        })
    }

    async run(msg, args) {
        Twitter.rateLimit()
    }
}