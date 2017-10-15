const Commando = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')

const DiscordSettings = require('./_data/settings.json').Discord
const Logger = require('./lib/logger')

const client = new Commando.Client({
    owner: ['153363129915539457'],
    commandPrefix: DiscordSettings.Prefix,
    commandEditableDuration: 15,
    nonCommandEditable: false,
    unknownCommandResponse: false,
    invite: DiscordSettings.ServerLink,
})

client
    .on('ready', () => {
        Logger.log('Ready')
        Logger.infoLog('READY')
        client.user.setGame('Electron Beams')
    })
    .on('reconnecting', () => {
        Logger.log('Reconnecting')
        Logger.infoLog('RECNT')
    })
    .on('debug', info => { Logger.infoLog('DEBUG', info) })
    .on('warn', info => { Logger.infoLog('WARN', info) })
    .on('error', error => {
        Logger.log('Error')
        Logger.infoLog('ERROR', error)
    })
    .on('resume', replayed => {
        Logger.log('Resume')
        Logger.infoLog('RESM', replayed)
    })
    .on('disconnect', event => {
        Logger.log('Disconnect')
        Logger.infoLog('DISCN', event)
    })
    .on('message', message => {})

client
    .setProvider(sqlite
        .open(path.join(__dirname, '_data', 'database.sqlite3'))
        .then(db => new Commando.SQLiteProvider(db))
    )
    .catch(console.error)

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['util', 'Utility'],
        ['cogsv', 'Cognitive Services'],
        ['kc', 'Kantai Collection'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

client.login(DiscordSettings.Token)