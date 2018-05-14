const { Command } = require('discord.js-commando')
const Settings = require('../../settings')
const TwitterClient = require('../../modules/TwitterClient')
const Logger = require('../../modules/Logger')

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

                let isOwner = this.client.isOwner(msg.author)
                if (!isOwner) return

                let json = JSON.stringify(resources, (key, value) => key !== 'reset' ? value : new Date(Number(value) * 1000).toLocaleDateString(Settings.Global.LocaleCode, Settings.Global.DateOptions), '  ')
                msg.channel
                    .send(`\`\`\`json\n${json}\n\`\`\``)
                    .catch(err => Logger.error(err))
            })
            .catch(err => Logger.error(err))
    }
}