const logger = require('log4js').getLogger('FbMessenger')

module.exports = function (client, config) {
  return function (user) {
    const imgSource = user.profile_image_url_https
    if (!imgSource) return

    const imgFull = imgSource.replace('_normal', '')
    logger.info(`Twitter Ava @${user.screen_name} >> ${imgFull}`)

    const message = `@${user.screen_name}\n${imgFull}`

    const uid = user.id_str
    const userConfig = config[uid]
    const threads = userConfig.messengerThreads || []

    threads.forEach(async thread => {
      try {
        await client.sendMessage(thread, message)
        logger.info(`Done >> ${thread}`)
      } catch (err) {
        logger.error(err)
      }
    })
  }
}
