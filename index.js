// Load process environment
const ENVIRONMENT = process.env
require('dotenv').config()

// Start discord client
require('./modules/discord-client').login()