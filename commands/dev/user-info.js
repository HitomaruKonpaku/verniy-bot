const { Command } = require('discord.js-commando')

module.exports = class UserInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'user',
            group: 'dev',
            memberName: 'user',
            description: '',
        })
    }

    async run(msg, args) {
        msg.client.fetchUser(args)
            .then(data => {
                var cache = []
                var json = JSON.stringify(data, function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return
                        }
                        // Store value in our collection
                        cache.push(value)
                    }
                    return value
                })
                cache = null
                console.log(json)
            })
            .catch(err => {
                console.trace(err)
            })
    }
}