const { CommandoClient } = require('discord.js-commando')
const path = require('path')

const logger = require('./logger')
const DiscordSettings = require('./settings.json').Discord

const client = new CommandoClient({
    owner: ['153363129915539457'],
    commandPrefix: '?',
    commandEditableDuration: 15,
    nonCommandEditable: false,
    unknownCommandResponse: false,
    invite: DiscordSettings.ServerLink,
})

let _connecting = false,
    _reconnecting = true

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['util', 'Utility'],
        ['cogsv', 'Cognitive Services'],
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

client
    .on('ready', () => {
        _connecting = true
        _reconnecting = false
        logger.log('Connected')
    })
    .on('error', err => {
        if (_connecting) {
            _connecting = false
            logger.log('Disconnected')
        }
    })
    .on('reconnecting', () => {
        if (!_reconnecting) {
            _reconnecting = true
            logger.log('Reconnecting...')
        }
    })
    .on('disconnect', ev => {

    })
    .on('message', msg => {

    })

client.login(DiscordSettings.Token)