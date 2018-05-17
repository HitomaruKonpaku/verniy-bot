const { Command } = require('discord.js-commando')
const Logger = require('../../modules/Logger')

module.exports = class DiscordSayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
            group: 'dev',
            memberName: 'say',
            description: '',
            ownerOnly: true,
            argsType: 'multiple',
            argsCount: '2',
        })
    }

    async run(msg, args) {
        const regex = /^<*[#@]*\d+>*$/g
        if (!args || args.length < 2 || !regex.test(args[0])) {
            return
        }

        const dest = args[0]
        const message = args[1]
        const id = dest.match(/\d+/)[0]

        if (this.client.users.some(v => v.id === id)) {
            this.client.users.get(id)
                .send(message)
                .catch(err => Logger.error(err))
        } else if (this.client.channels.some(v => v.id === id)) {
            this.client.channels.get(id)
                .send(message)
                .catch(err => Logger.error(err))
        }
    }
}