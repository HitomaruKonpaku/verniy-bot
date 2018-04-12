const Commando = require('discord.js-commando')
const path = require('path')
const TwitterClient = require('./TwitterClient')
const Cron = require('./Cron')
const Logger = require('./Logger')

class DiscordClient {
    constructor() {
        Logger.log('DiscordClient constructor')
        // Get variables for client
        this.token = process.env.DISCORD_TOKEN_BOT
        let owner = process.env.DISCORD_OWNER || '153363129915539457'
        let commandPrefix = process.env.DISCORD_PREFIX || '.'
        let commandEditableDuration = 20
        let nonCommandEditable = false
        let unknownCommandResponse = false
        // Init client
        this.client = new Commando.Client({
            owner,
            commandPrefix,
            commandEditableDuration,
            nonCommandEditable,
            unknownCommandResponse,
        })
        // Client events
        this.client
            // Emitted when the client becomes ready to start working
            .on('ready', () => {
                Logger.log(`${this.client.user.tag} READY!!!`)

                this.twitter = new TwitterClient()
                this.twitter.checkNewTweet({ discord: this.client })
                this.twitter.checkNewAva({ discord: this.client })

                Cron.start(this.client)
            })
            // Emitted whenever the client tries to reconnect to the WebSocket
            .on('reconnecting', () => {
                Logger.log('RECONNECTING')
            })
            // Emitted for general debugging information
            .on('debug', info => {
                // Skip
                if ([
                    'Authenticated using token',
                    'Sending a heartbeat',
                    'Heartbeat acknowledged',
                ].some(v => info.indexOf(v) != -1)) {
                    return
                }
                // Format
                info = info.replace(/\.$/, '')
                Logger.debug(info)
            })
            // Emitted for general warnings
            .on('warn', info => {
                info = info.replace(/\.$/, '')
                Logger.warn(info)
            })
            // Emitted whenever the client's WebSocket encounters a connection error
            .on('error', error => {
                Logger.error(error)

                if (error.indexOf('ECONNRESET') != -1) {
                    this.client
                        .destroy()
                        .then(() => setTimeout(() => { this.start() }, 1000))
                }
            })
            // Emitted whenever a WebSocket resumes
            .on('resume', replayed => {
            })
            // Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect
            .on('disconnect', event => {
                Logger.warn('DISCONNECT')
            })
            // Emitted whenever a message is created
            .on('message', message => {
            })

        // Client registries
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                ['dev', 'Developer'],
                ['util', 'Utility'],
                ['kc', 'KanColle'],
                ['fun', 'Funny'],
            ])
            .registerCommandsIn(path.join(__dirname, '..', 'commands'))
    }
    start() {
        this.client
            .login(this.token)
            .catch(err => Logger.error(err.message))
    }
}

module.exports = DiscordClient