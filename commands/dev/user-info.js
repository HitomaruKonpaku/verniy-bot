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
                console.log(JSON.stringify(data))
            })
            .catch(err => {
                console.trace(err)
            })
    }
}