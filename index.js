const Commando = require('discord.js-commando')
const Settings = require('./_data/settings.js')

const twitter = require('./modules/twitter')

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

        // Worker
        twitter.run(client)
    })
    .on('reconnecting', () => { })
    .on('debug', info => { })
    .on('warn', info => { })
    .on('error', error => { })
    .on('resume', replayed => { })
    .on('disconnect', event => { })
    .on('message', message => { })

client.login(Settings.Discord.Token)