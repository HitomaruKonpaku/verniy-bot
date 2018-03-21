// Load process environment
require('dotenv').config()

const Commando = require('discord.js-commando')
const path = require('path')
const Settings = require('./settings')
const Log = require('./modules/logger')

var tf = require('./modules/twitter-api')

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
        // Log
        Log.info(`${client.user.tag} READY!`)

        // KanColle cron
        require('./modules/kc-cron').run(client)

        // Twitter stalker
        tf.init({
            ConsumerKey: process.env.TWITTER_CONSUMER_KEY,
            ConsumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            AccessToken: process.env.TWITTER_ACCESS_TOKEN,
            AccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
        })
        tf.follow({ discord: client, follows: Settings.TwitterFollow })
        tf.followAva({ discord: client })

    })
    .on('reconnecting', () => { })
    .on('debug', info => { })
    .on('warn', info => { })
    .on('error', error => { })
    .on('resume', replayed => { })
    .on('disconnect', event => { })
    .on('message', message => { })

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['dev', 'Developer'],
        ['util', 'Utility'],
        ['kc', 'KanColle'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

// Log in section
Log.custom('connecting', 'Logging in to Discord...')
client.login(process.env.DISCORD_TOKEN)