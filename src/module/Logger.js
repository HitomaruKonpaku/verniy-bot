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
    const msg = error.message || error
    console.log('ERORR ' + msg)
    if (error.stack) {
      require('./Util').sendDiscordWebhook({
        url: ConfigVar.APP_NOTIFICATION_DISCORD_WEBHOOK,
        message: '```\n' + error.stack || error.message + '\n```'
      })
    }
    if (['ECONNRESET'].some(v => msg.includes(v))) {
      return
    }
    console.trace(error)
  }

}

module.exports = new Logger()
