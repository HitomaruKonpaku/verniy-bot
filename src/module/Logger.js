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
    const msg = error.message ? error.message : error
    console.log('WARN ' + msg)
  }

  error(error) {
    if (!error) return
    const msg = error.message ? error.message : error
    console.log('ERORR ' + msg)
    if (error.stack) {
      sendDiscordWebhook(error.stack)
    }
    if (['ECONNRESET'].some(v => msg.includes(v))) {
      return
    }
    console.trace(error)
  }

}

module.exports = new Logger()

async function sendDiscordWebhook(msg) {
  const { WebhookClient } = require('discord.js')
  const whUrl = ConfigVar.APP_NOTIFICATION_DISCORD_WEBHOOK
  if (!whUrl) return
  const whData = whUrl.split('/')
  if (whData.length != 7) return
  const whId = whData[5]
  const whToken = whData[6]
  const whClient = new WebhookClient(whId, whToken)
  try {
    const codeBlock = '```'
    const message = [codeBlock, msg, codeBlock].join('\n')
    await whClient.send(message)
  }
  catch (err) {
    console.log(err)
  }
}
