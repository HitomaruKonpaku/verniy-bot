// Load process environment
require('dotenv').config()
console.log('Environment Variables loaded!')

// 
const DiscordClient = require('./modules/DiscordClient')

// 
let discord = new DiscordClient()
discord.start()
