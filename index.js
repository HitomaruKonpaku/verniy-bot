const Commando = require('discord.js-commando')
const path = require('path')
const Settings = require('./_data/settings')
const Log = require('./modules/logger')

var tf = require('./modules/twitter-api')

const client = new Commando.Client({
    owner: Settings.Discord.Owner,
    commandPrefix: Settings.Discord.Prefix,
    commandEditableDuration: 15,
    nonCommandEditable: false,
    unknownCommandResponse: false,
    // invite: Settings.Discord.InviteLink,
})

client
    .on('ready', () => {
        // Log
        Log.info(`${client.user.tag} READY!`)

        // Twitter stalker
        tf.init({
            ConsumerKey: Settings.Twitter.ConsumerKey,
            ConsumerSecret: Settings.Twitter.ConsumerSecret,
            AccessToken: Settings.Twitter.AccessToken,
            AccessTokenSecret: Settings.Twitter.AccessTokenSecret,
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
client.login(Settings.Discord.Token)