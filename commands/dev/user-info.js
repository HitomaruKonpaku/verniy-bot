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
            .then(user => {
                console.log(JSON.stringify({
                    avatar: user.avatar,
                    avatarURL: user.avatarURL,
                    bot: user.bot,
                    createdAt: user.createdAt,
                    createdTimestamp: user.createdTimestamp,
                    defaultAvatarURL: user.defaultAvatarURL,
                    discriminator: user.discriminator,
                    displayAvatarURL: user.displayAvatarURL,
                    id: user.id,
                    username: user.username,
                }))

                // var cache = []
                // var json = JSON.stringify(data, function (key, value) {
                //     if (typeof value === 'object' && value !== null) {
                //         if (cache.indexOf(value) !== -1) {
                //             // Circular reference found, discard key
                //             return
                //         }
                //         // Store value in our collection
                //         cache.push(value)
                //     }
                //     return value
                // })
                // cache = null
                // console.log(json)

            })
            .catch(err => {
                console.trace(err)
            })
    }
}