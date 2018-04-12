// Load process environment
require('dotenv').config()

// 
const DiscordClient = require('./modules/DiscordClient')

// 
let discord = new DiscordClient()
discord.start()
