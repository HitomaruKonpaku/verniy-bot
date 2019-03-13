const ConfigVar = require('./ConfigVar')

class Logger {

  log(message) {
    if (!message) return
    console.log('INFO ' + message)
  }

  debug(message) {
    if (!message) return
    console.log('DEBUG ' + message)
  }

  warn(error) {
    if (!error) return
    const msg = error.message || error
    console.log('WARN ' + msg)
  }

  error(error) {
    if (!error) return
    // New error with this function included in stack
    error = new Error(error.message || error)
    const msg = error.message
    console.log('ERORR ' + msg)
    // Send error to Discord
    if (error.stack) {
      const block = '```'
      require('./Util').sendDiscordWebhook({
        url: ConfigVar.APP_NOTIFICATION_DISCORD_WEBHOOK,
        message: [block, error.stack || error.message, block].join('\n')
      })
    }
    // Skip trace of some error
    if (['ECONNRESET'].some(v => msg.includes(v))) {
      return
    }
    // Trace
    console.trace(error)
  }

}

module.exports = new Logger()
