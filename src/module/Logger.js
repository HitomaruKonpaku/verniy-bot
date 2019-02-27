require('dotenv').config()
const { WebhookClient } = require('discord.js')

module.exports = {
  log: msg => {
    console.log(`INFO ${msg}`)
  },
  debug: msg => {
    console.log(`DEBUG ${msg}`)
  },
  warn: err => {
    const msg = err.message ? err.message : err
    console.log(`WARN ${msg}`)
  },
  error: err => {
    const msg = err.message ? err.message : err
    console.log(`ERROR ${msg}`)
    if (err.stack) {
      sendDiscordWebhook(err.stack)
    }
    if (['ECONNRESET'].some(v => msg.includes(v))) {
      return
    }
    console.trace(err)
  }
}

async function sendDiscordWebhook(msg) {
  const whUrl = process.env.APP_NOTIFICATION_DISCORD_WEBHOOK
  if (!whUrl) return
  const whData = whUrl.split('/')
  if (whData.length != 7) return
  const whId = whData[5]
  const whToken = whData[6]
  const whClient = new WebhookClient(whId, whToken)
  try {
    const codeBlock = '```'
    const message = [codeBlock, msg, [...codeBlock].reverse().join('')].join('\n')
    await whClient.send(message)
  }
  catch (err) {
    console.log(err)
  }
}
