const logger = require('log4js').getLogger('FbMessenger')

module.exports = function(client) {
  return function(message, command) {
    const response = getResponse(command)
    if (!response) {
      return
    }
    logger.debug(`Running command ${command.name}`)
    client.sendMessage(message.threadId, response)
  }

  function getResponse(command) {
    const KC = AppConfig.KanColle
    const commandMapper = {
      'akashi': KC.Akashi,
      'tsundb': KC.TsunDB,
      'lb': KC.LBAS,
      'aaci': KC.AACI,
      'ai': KC.AntiInstallation,
      'plane': KC.Plane,
      'as': KC.AirPower,
      'dev': KC.Development
    }

    if (commandMapper[command.name]) {
      return commandMapper[command.name]
    }

    switch (command.name) {
      case 'help':
        return 'Commands: ' + Object.keys(commandMapper).join(', ')
      case 'ping':
        return 'Pong!'
    }

    return ''
  }
}
