// Load logger
const Logger = require('./modules/Logger')
Logger.log('STARTING.....')

// Load process environment
require('dotenv').config()
Logger.log('Environment Variables loaded!')

// Load prototype
require('./modules/Prototype').load()

// Load discord
const DiscordClient = require('./modules/DiscordClient')
const discord = new DiscordClient()
discord.start()
