const Commando = require('discord.js-commando')
const path = require('path')
const Settings = require('./_data/settings')

var tf = require('./modules/twitter-follow')

const client = new Commando.Client({
    owner: Settings.Discord.Owner,
    commandPrefix: Settings.Discord.Prefix,
    commandEditableDuration: 15,
    nonCommandEditable: false,
    unknownCommandResponse: false,
    invite: Settings.Discord.InviteLink,
})

client
    .on('ready', () => {
        // Log
        console.log(`${client.user.tag} online!`)

        // Twitter stalker
        tf.init({
            ConsumerKey: Settings.Twitter.ConsumerKey,
            ConsumerSecret: Settings.Twitter.ConsumerSecret,
            AccessToken: Settings.Twitter.AccessToken,
            AccessTokenSecret: Settings.Twitter.AccessTokenSecret,
        })
        tf.follow({ discord: client, follows: Settings.TwitterFollow })

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
        ['util', 'Utility'],
        ['kc', 'KanColle'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

client.login(Settings.Discord.Token)