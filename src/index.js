// // Load process environment
// require('dotenv').config()

// // Start discord client
// require('./modules/discord-client').login()


const { DiscordClient } = require('./modules')

var discord = new DiscordClient()
discord.start()
