const logger = require('log4js').getLogger('FbMessenger')
const login = require('facebook-chat-api')
const fs = require('fs')

const FileManager = require('./FileManager')

class FbMessBot {

  constructor() {
    const options = { forceLogin: true }
    const credentials = {}

    logger.info('Loading credential')
    if (fs.existsSync(FileManager.FbAppStateFile)) {
      logger.debug('Using FbAppStateFile')
      credentials.appState = JSON.parse(fs.readFileSync(FileManager.FbAppStateFile, 'utf8'))
    } else if (AppConst.FB_MESS_APPSTATE) {
      logger.debug('Using FB_MESS_APPSTATE')
      credentials.appState = JSON.parse(AppConst.FB_MESS_APPSTATE)
    } else {
      logger.debug('Using email & password')
      credentials.email = process.env.FACEBOOK_EMAIL
      credentials.password = process.env.FACEBOOK_PASSWORD
      if (!credentials.email || !credentials.password) {
        logger.warn('Missing FACEBOOK_EMAIL or FACEBOOK_PASSWORD')
        return
      }
    }

    login(credentials, options, loginCallback)
  }

}

module.exports = new FbMessBot()

function loginCallback(err, api) {
  if (err) loginError(err)
  if (api) loginSuccess(api)
}

function loginError(err) {
  const readline = require('readline')
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  switch (err.error) {
    case 'login-approval':
      logger.info('Enter code > ')
      rl.on('line', (line) => {
        err.continue(line)
        rl.close()
      })
      break
  }

  logger.error(err.error)
}

function loginSuccess(api) {
  logger.info('Logged in!')

  // Save AppState
  fs.writeFileSync(FileManager.FbAppStateFile, JSON.stringify(api.getAppState()))

  api.listen((err, message) => {
    if (err) logger.error(err)
    if (message) onReceiveMessage(message)
  })

  function onReceiveMessage(message) {
    logger.trace(message)
    const command = getCommand(message.body)
    if (command) {
      const response = getCommandResponse(command)
      if (!response) return
      api.sendMessage(response, message.threadID)
    }
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

  function getCommandResponse(command) {
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
