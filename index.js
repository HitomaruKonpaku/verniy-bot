// Load process environment
const ENVIRONMENT = process.env
require('dotenv').config()

// Global config
const stackTraceLimit = Number(ENVIRONMENT.STACK_TRACE_LIMIT) || Error.stackTraceLimit
console.log(`StackTraceLimit: ${stackTraceLimit}`)
Error.stackTraceLimit = stackTraceLimit

// Start discord client
require('./modules/discord-client').login()