const logger = require('log4js').getLogger('FbMessenger')

module.exports = function(client) {
  return function(message) {
    logger.trace(message)
    const command = getCommand(message.message)
    if (!command) {
      return
    }
    client.emit('command', message, command)
  }

  function getCommand(message) {
    message = message.trim()
    const prefix = AppConst.DISCORD_PREFIX || '.'
    const rx = new RegExp(`^\\${prefix}\\w+`, 'g')
    const command = (rx.exec(message) || [])[0]
    if (!command) return
    const name = command.replace(prefix, '')
    const args = message.replace(command, '').trim().split(' ')
    return { message, prefix, name, args }
  }
}
