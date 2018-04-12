// Load process environment
require('dotenv').config()

// 
const Logger = require('./modules/Logger')
const DiscordClient = require('./modules/DiscordClient')

Logger.log('STARTING.....')
Logger.log('Environment Variables loaded!')

// 
let discord = new DiscordClient()
discord.start()
