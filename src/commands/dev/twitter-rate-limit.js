const { Command } = require('discord.js-commando')
const TwitterClient = require('../../modules/TwitterClient')

module.exports = class TwitterRateLimitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'trl',
            group: 'dev',
            memberName: 'trl',
            description: '',
            guarded: true,
        })
    }

    async run(msg, args) {
        let twitter = new TwitterClient()
        twitter.checkRateLimit()
    }
}