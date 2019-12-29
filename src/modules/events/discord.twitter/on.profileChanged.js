const logger = require('log4js').getLogger('Discord')
const Util = require('../../Util')

module.exports = function (client, config) {
  return function (user) {
    const imgSource = user.profile_image_url_https
    if (!imgSource) return

    const imgFull = imgSource.replace('_normal', '')
    logger.info(`Twitter Ava @${user.screen_name} >> ${imgFull}`)

    const uid = user.id_str
    const userConfig = config[uid]
    const channels = userConfig.channels || []
    const channels2 = userConfig.channelsAsUser || []

    const message = `**@${user.screen_name}**`
    const options = { files: [imgFull] }

    Util.Discord.sendMessageAsBot({ client, channels, message, options })
    Util.Discord.sendMessageAsUser({ channels: channels2, message, options })
  }
}
