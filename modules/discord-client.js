const Commando = require('discord.js-commando')
const path = require('path')

const Settings = require('../settings')
const Logger = require('../modules/logger')
const Twitter = require('../modules/twitter-client')

const client = new Commando.Client({
    owner: process.env.DISCORD_OWNER || '153363129915539457',
    commandPrefix: process.env.DISCORD_PREFIX || '.',
    commandEditableDuration: 15,
    nonCommandEditable: false,
    unknownCommandResponse: false,
    // invite: Settings.Discord.InviteLink,
})

client
    .on('ready', () => {
        Logger.log(`${client.user.tag} READY!`)

        // KanColle cron
        require('../modules/kc-cron').run(client)

        // Twitter client
        Twitter.init({
            ConsumerKey: process.env.TWITTER_CONSUMER_KEY,
            ConsumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            AccessToken: process.env.TWITTER_ACCESS_TOKEN,
            AccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        })
        Twitter.follow({ discord: client, follows: Settings.TwitterFollow })
        Twitter.followAva({ discord: client })

    })
    .on('reconnecting', () => {
        Logger.log('RECONNECTING...')

    })
    .on('debug', info => {
        // Skip
        if ([
            'Authenticated using token',
            'Sending a heartbeat',
            'Heartbeat acknowledged',
        ].some(v => info.indexOf(v) != -1)) {
            return
        }

        // 
        Logger.log(`DEBUG: ${info}`)

        // Attemp to reconnect twitter-follow
        if (info.indexOf(`[ws] [connection] RESUMED`) != -1) {
            Twitter.follow({ discord: client, follows: Settings.TwitterFollow })
        }
    })
    .on('warn', info => {
        Logger.log(`WARN: ${info}`)
    })
    .on('error', error => {
        console.trace(error)
        Logger.error(error)

        // Restart client
        if (info.indexOf('ECONNRESET') != -1) {
            _relog()
        }
    })
    .on('resume', replayed => {
        Logger.log(`RESUME: ${replayed}`)
    })
    .on('disconnect', event => { })
    .on('message', message => { })

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['dev', 'Developer'],
        ['util', 'Utility'],
        ['kc', 'KanColle'],
        ['fun', 'Funny'],
    ])
    .registerCommandsIn(path.join(__dirname, '..', 'commands'))

function _login() {
    Logger.log('Connecting to Discord server...')
    client
        .login(process.env.DISCORD_TOKEN)
        .catch(err => {
            console.trace(err)
            Logger.error(err)
        })
}

function _relog() {
    Logger.log('Relogging...')
    client
        .destroy()
        .then(() => {
            _login()
        })
}

module.exports = {
    login: () => {
        _login()
    }
}