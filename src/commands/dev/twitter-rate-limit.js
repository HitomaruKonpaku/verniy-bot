const { Command } = require('discord.js-commando')
const Settings = require('../../settings')
const Logger = require('../../modules/Logger')
const TwitterClient = require('../../modules/TwitterClient')

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
                let resources = {}
                let users = {}
                resources['users'] = users
                users['/users/show/:id'] = data.resources.users['/users/show/:id']
                Logger.log(`TRL: ${JSON.stringify(resources)}`)

                const isOwner = this.client.isOwner(msg.author)
                if (!isOwner) return

                const json = JSON.stringify(resources, (key, value) =>
                    key !== 'reset' ? value : new Date(Number(value) * 1000)
                        .toLocaleDateString(Settings.Global.LocaleCode, Settings.Global.DateOptions), '  ')
                const message = `\`\`\`json\n${json}\n\`\`\``
                return msg.say(message)
            })
            .catch(err => Logger.error(err))
    }
}