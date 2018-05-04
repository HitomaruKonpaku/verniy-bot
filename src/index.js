// Load logger
const Logger = require('./modules/Logger')
Logger.log('STARTING.....')

// Load process environment
require('dotenv').config()
Logger.log('Environment Variables loaded!')

// Load discord
const DiscordClient = require('./modules/DiscordClient')
let discord = new DiscordClient()
discord.start()
