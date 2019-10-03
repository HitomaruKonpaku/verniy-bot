const request = require('request')
const http = require('http')
const Twit = require('twit')

const logger = require('log4js').getLogger('KCServerWatcher')

const config = {
  consumer_key: AppConst.KCSERVERWATCHER_TWITTER_CONSUMER_KEY,
  consumer_secret: AppConst.KCSERVERWATCHER_TWITTER_CONSUMER_SECRET,
  access_token: AppConst.KCSERVERWATCHER_TWITTER_ACCESS_TOKEN,
  access_token_secret: AppConst.KCSERVERWATCHER_TWITTER_ACCESS_TOKEN_SECRET
}

const webhooks = {
  SERVER_INFO: AppConst.KCSERVERWATCHER_DISCORD_WEBHOOK_SERVER_INFO,
  MAINT_INFO: AppConst.KCSERVERWATCHER_DISCORD_WEBHOOK_MAINT_INFO
}

const T = new Twit(config)

const servers = [
  {
    'jp': '横須賀鎮守府',
    'en': 'Yokosuka',
    'ip': '203.104.209.71'
  },
  {
    'jp': '呉鎮守府',
    'en': 'Kure',
    'ip': '203.104.209.87'
  },
  {
    'jp': '佐世保鎮守府',
    'en': 'Sasebo',
    'ip': '125.6.184.215'
  },
  {
    'jp': '舞鶴鎮守府',
    'en': 'Maizuru',
    'ip': '203.104.209.183'
  },
  {
    'jp': '大湊警備府',
    'en': 'Oominato',
    'ip': '203.104.209.150'
  },
  {
    'jp': 'トラック泊地',
    'en': 'Truk',
    'ip': '203.104.209.134'
  },
  {
    'jp': 'リンガ泊地',
    'en': 'Lingga',
    'ip': '203.104.209.167'
  },
  {
    'jp': 'ラバウル基地',
    'en': 'Rabaul',
    'ip': '203.104.209.199'
  },
  {
    'jp': 'ショートランド泊地',
    'en': 'Shortland',
    'ip': '125.6.189.7'
  },
  {
    'jp': 'ブイン基地',
    'en': 'Buin',
    'ip': '125.6.189.39'
  },
  {
    'jp': 'タウイタウイ泊地',
    'en': 'Tawi',
    'ip': '125.6.189.71'
  },
  {
    'jp': 'パラオ泊地',
    'en': 'Palau',
    'ip': '125.6.189.103'
  },
  {
    'jp': 'ブルネイ泊地',
    'en': 'Brunei',
    'ip': '125.6.189.135'
  },
  {
    'jp': '単冠湾泊地',
    'en': 'Hitokappu',
    'ip': '125.6.189.167'
  },
  {
    'jp': '幌筵泊地',
    'en': 'Paramushiru',
    'ip': '125.6.189.215'
  },
  {
    'jp': '宿毛湾泊地',
    'en': 'Sukumo',
    'ip': '125.6.189.247'
  },
  {
    'jp': '鹿屋基地',
    'en': 'Kanoya',
    'ip': '203.104.209.23'
  },
  {
    'jp': '岩川基地',
    'en': 'Iwagawa',
    'ip': '203.104.209.39'
  },
  {
    'jp': '佐伯湾泊地',
    'en': 'Saiki',
    'ip': '203.104.209.55'
  },
  {
    'jp': '柱島泊地',
    'en': 'Hashirajima',
    'ip': '203.104.209.102'
  }]

const lastState = {}
const serverInfoQueue = []

for (let s of servers) {
  if (lastState[s.en] == undefined) {
    lastState[s.en] = true
  }
}

function test() {
  setTimeout(() => test(), 20 * 1000)
  setTimeout(() => tweetServerInfoQueue(), 17500)

  for (let s of servers) {
    testServer(s.ip, (up) => {
      let d = new Date()
      d.setTime(d.getTime() + 60 * 1000 * (d.getTimezoneOffset() + (9 * 60)))

      logger.debug(`${s.en}\t${up}`)
      if (lastState[s.en] != up) {
        serverInfoQueue.push(`${up ? '📈' : '📉'} ${s.jp} (${s.en}): ${up ? 'online' : 'offline'} @ ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`)
      }
      lastState[s.en] = up
    })
  }

  updateMaint()
}

let lastMaintLine = undefined, oldVersion = undefined
function updateMaint() {
  request({
    url: 'http://203.104.209.7/gadget_html5/js/kcs_const.js',
    method: 'GET'
    // eslint-disable-next-line no-unused-vars
  }, (e, r, b) => {
    if (e) return

    let maintInfo = {}
    let newVersion = undefined
    for (let line of r.body.split('\n')) {
      if (line.indexOf('MaintenanceInfo.IsDoing') >= 0)
        maintInfo.isDoing = !!parseInt(line.split('= ')[1].replace(';', '').trim())
      else if (line.indexOf('MaintenanceInfo.IsEmergency') >= 0)
        maintInfo.isEmergency = !!parseInt(line.split('= ')[1].replace(';', '').trim())
      else if (line.indexOf('MaintenanceInfo.EndDateTime') >= 0)
        maintInfo.endDateTime = line.split('parse("')[1].replace('");', '').trim()
      else if (line.indexOf('VersionInfo.scriptVesion') >= 0)
        newVersion = line.split('"')[1].replace('";', '').trim()
    }

    let infoLine
    if (maintInfo.isDoing) {
      infoLine = [
        [
          '📉',
          maintInfo.isEmergency ? '[Emergency]' : '',
          'Maintenance ongoing'
        ].join(' '),
        'Expected end time: ' + maintInfo.endDateTime
      ].join('\n')
    } else {
      infoLine = '📈 Maintenance ended'
    }

    if (lastMaintLine == undefined)
      lastMaintLine = infoLine
    else if (lastMaintLine != infoLine) {
      sendTweet(infoLine)
      sendDiscordWebhook(infoLine, webhooks.MAINT_INFO)
    }

    if (newVersion != oldVersion && newVersion != undefined && oldVersion != undefined) {
      let line = `Game version changed from ${oldVersion} -> ${newVersion}`
      sendTweet(line)
      sendDiscordWebhook(line, webhooks.MAINT_INFO)
    }

    lastMaintLine = infoLine
    oldVersion = newVersion
  })
}

function tweetServerInfoQueue() {
  logger.debug('Tweeting ' + serverInfoQueue.length + ' lines')
  let currentTweet = ''
  sendDiscordWebhook(serverInfoQueue.join('\n'), webhooks.SERVER_INFO)
  while (serverInfoQueue.length > 0) {
    let newTweet = serverInfoQueue.pop()
    if (currentTweet.length + newTweet.length > 130) {
      sendTweet(currentTweet)
      currentTweet = ''
    }
    currentTweet = currentTweet + '\n' + newTweet
  }
  if (currentTweet.length > 0) {
    sendTweet(currentTweet)
  }
}

function testServer(server, callback) {
  logger.debug('Trying ' + server)
  let options = { method: 'HEAD', host: server, port: 80, path: '/', timeout: 15000 }
  let req = http.request(options, async function(res) {
    logger.debug(server, res.statusCode)
    callback(true)
  })
  req.on('socket', function(socket) {
    socket.setTimeout(15000)
    socket.on('timeout', function() {
      req.abort()
    })
  })
  req.on('error', () => callback(false))
  req.end()
}

function sendTweet(msg) {
  let tweet = {
    status: msg
  }
  // eslint-disable-next-line no-unused-vars
  T.post('statuses/update', tweet, function(e, d, r) {
    if (e) {
      logger.error(e)
    } else {
      logger.debug('Tweeted ' + JSON.stringify(d))
    }
  })
}

function sendDiscordWebhook(msg, webhookUrl) {
  if (!webhookUrl) {
    logger.warn('KCServerWatcher - Missing Webhook Url')
    return
  }
  let payload = { 'content': msg }
  request({
    url: webhookUrl,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
    // eslint-disable-next-line no-unused-vars
  }, (e, r, b) => {
    if (e) {
      logger.error(e)
    }
  })
}

module.exports = {
  start() {
    const msg = 'Starting...'
    logger.info(msg)
    // sendDiscord(msg)
    test()
  }
}
