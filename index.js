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
        client.user.setGame('Electron Beams')
        Logger.console({ user: client.user.tag, message: 'Ready!' })
        Logger.file({ level: 'ready', data: 'Client ready!' })
    })
    .on('reconnecting', () => {
        Logger.file({ level: 'reconnecting', data: 'Reconnecting...' })
    })
    .on('debug', info => {
        Logger.file({ level: 'debug', data: info })
    })
    .on('warn', info => {
        Logger.file({ level: 'warn', data: info })
    })
    .on('error', error => {
        Logger.file({ level: 'error', data: error })
    })
    .on('resume', replayed => {
        Logger.console({ user: client.user.tag, message: 'Resume' })
        Logger.file({ level: 'resume', data: replayed })
    })
    .on('disconnect', event => {
        Logger.file({ level: 'disconnect', data: event })
    })
    .on('message', message => {

    })

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