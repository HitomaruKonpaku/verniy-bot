const { Command } = require('discord.js-commando')
const Setting = require('../../setting')
const Logger = require('../../module/Logger')
const TwitterClient = require('../../module/TwitterClient')

module.exports = class TwitterRateLimitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'trl',
            group: 'dev',
            memberName: 'trl',
            description: '',
        })
    }

    async run(msg) {
        let twitter = new TwitterClient()
        twitter
            .checkRateLimit()
            .then(data => {
                const respResources = data.data.resources
                const resources = {}
                const users = {}
                resources['users'] = users
                users['/users/show/:id'] = respResources.users['/users/show/:id']
                Logger.log(`TWITTER RATE LIMIT: ${JSON.stringify(resources)}`)

                const isOwner = this.client.isOwner(msg.author)
                if (!isOwner) return

                const json = JSON.stringify(resources, (key, value) =>
                    key !== 'reset'
                        ? value
                        : new Date(Number(value) * 1000).toCustomString(Setting.Global.TimezoneOffset)
                    , '  ')
                const message = `\`\`\`json\n${json}\n\`\`\``
                return msg.say(message)
            })
            .catch(err => Logger.error(err))
    }
}