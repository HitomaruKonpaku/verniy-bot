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

let _connecting = false,
    _reconnecting = true

client
    .on('ready', () => {
        _connecting = true
        _reconnecting = false
        Logger.log('Connected')
        client.user.setGame('Electron Beams')
    })
    .on('error', err => {
        if (_connecting) {
            _connecting = false
            Logger.log('Disconnected')
        }
    })
    .on('reconnecting', () => {
        if (!_reconnecting) {
            _reconnecting = true
            Logger.log('Reconnecting...')
        }
    })
    .on('disconnect', ev => {

    })
    .on('message', msg => {

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