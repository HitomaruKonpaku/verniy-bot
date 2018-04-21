const { Command } = require('discord.js-commando')
const Heroku = require('heroku-client')
const Logger = require('../../modules/Logger')

module.exports = class HerokuRestartCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'restart',
            group: 'dev',
            memberName: 'restart',
            description: '',
            guarded: true,
        })
    }

    async run(msg, args) {
        let isOwner = this.client.isOwner(msg.author)
        if (!isOwner) return

        const key = process.env.HEROKU_API_KEY
        if (!key) {
            Logger.warn(`HEROKU_API_KEY not found`)
            return
        }

        Logger.log(`Restart all dynos request from ${msg.author.tag}`)
        this.client.destroy()

        const heroku = new Heroku({ token: process.env.HEROKU_API_KEY })
        const appName = 'hito-verniy'
        heroku
            .delete(`/apps/${appName}/dynos`)
            .then(app => Logger.log(`Restarting all dynos`))
            .catch(err => Logger.error(err))
    }
}