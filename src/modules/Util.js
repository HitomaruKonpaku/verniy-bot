const logger = require('log4js').getLogger('Util')

class Util {

  async sendEmail({ email, subject, content }) {
    // Origin
    const userOrig = {
      email: AppConst.APP_SYSTEM_EMAIL_ADDRESS,
      pass: AppConst.APP_SYSTEM_EMAIL_PASSWORD
    }
    if (!userOrig.email || !userOrig.pass) {
      logger.warn('APP_SYSTEM_EMAIL_ADDRESS or APP_SYSTEM_EMAIL_PASSWORD not found')
      return
    }
    // Destination
    if (!email) {
      logger.warn('Destination user\'s email not found')
      return
    }
    // Transporter
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userOrig.email,
        pass: userOrig.pass
      }
    })
    // Mail data
    const mailOptions = {
      to: email,
      subject: subject,
      text: content
    }
    // Send
    try {
      await transporter.sendMail(mailOptions)
      logger.info('Email >> Sent')
    } catch (err) {
      logger.error(err)
    }
  }

  async sendDiscordWebhook({ url, id, token, message, embed }) {
    // Check id & token
    if (url) {
      const arr = url.split('/')
      if (arr.length != 7) return
      id = arr[5]
      token = arr[6]
    }
    if (!id || !token) {
      return
    }
    // Send
    const { WebhookClient } = require('discord.js')
    const wh = new WebhookClient(id, token)
    try {
      await wh.send(message, embed)
      logger.info('Webhook >> Sent')
    }
    catch (err) {
      logger.error(err)
    }
  }

  async sendDiscordMessageAsBot({ client, channels, message, embed }) {
    if ((channels || []).length === 0) {
      return
    }

    const logger = require('log4js').getLogger('DiscordMessage')
    channels.forEach(async(cid) => {
      const channel = client.channels.get(cid)
      if (!channel) return
      const guild = channel.guild

      try {
        await channel.send(message, embed)
        logger.info(`Done >> ${guild.name} #${channel.name}`)
      } catch (err) {
        if (err.code) {
          logger.warn({
            code: err.code,
            message: err.message,
            guild: {
              id: guild.id,
              name: guild.name
            },
            channel: {
              id: channel.id,
              name: channel.name
            }
          })
          return
        }
        logger.error(err)
      }
    })
  }

  async sendDiscordMessageAsUser({ channels, message, embed }) {
    if ((channels || []).length === 0) return
    const token = AppConst.DISCORD_TOKEN_USER
    if (!token) return

    const logger = require('log4js').getLogger('Discord4User')
    const loggerMessage = require('log4js').getLogger('Discord4UserMessage')
    const client = new (require('discord.js').Client)
    const sendTotal = channels.length
    let sendCount = 0

    client.on('ready', () => {
      logger.info(`${client.user.tag} ONLINE!`)
      channels.forEach(async(cid) => {
        const channel = client.channels.get(cid)
        if (!channel) return
        const guild = channel.guild

        try {
          await channel.send(message, embed)
          loggerMessage.info(`Done >> ${guild.name} #${channel.name}`)
        } catch (err) {
          loggerMessage.error(err)
        }

        sendCount++
        if (sendCount !== sendTotal) {
          return
        }

        logger.info('Disconnecting...')
        client
          .destroy()
          .then(() => logger.info('Disconnected'))
      })
    })

    logger.info('Connecting...')
    client.login(token)
  }

}

module.exports = new Util()
