const request = require('request')
const http = require('http')
const Twit = require('twit')

const LOG_ENABLE = false

const config = {
    consumer_key: process.env.KCSERVERWATCHER_TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.KCSERVERWATCHER_TWITTER_CONSUMER_SECRET,
    access_token: process.env.KCSERVERWATCHER_TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.KCSERVERWATCHER_TWITTER_ACCESS_TOKEN_SECRET,
}

const T = new Twit(config)

const servers = [
    {
        'jp': '横須賀鎮守府',
        'en': 'Yokosuka',
        'ip': '203.104.209.71',
    },
    {
        'jp': '呉鎮守府',
        'en': 'Kure',
        'ip': '203.104.209.87',
    },
    {
        'jp': '佐世保鎮守府',
        'en': 'Sasebo',
        'ip': '125.6.184.215',
    },
    {
        'jp': '舞鶴鎮守府',
        'en': 'Maizuru',
        'ip': '203.104.209.183',
    },
    {
        'jp': '大湊警備府',
        'en': 'Oominato',
        'ip': '203.104.209.150',
    },
    {
        'jp': 'トラック泊地',
        'en': 'Truk',
        'ip': '203.104.209.134',
    },
    {
        'jp': 'リンガ泊地',
        'en': 'Lingga',
        'ip': '203.104.209.167',
    },
    {
        'jp': 'ラバウル基地',
        'en': 'Rabaul',
        'ip': '203.104.209.199',
    },
    {
        'jp': 'ショートランド泊地',
        'en': 'Shortland',
        'ip': '125.6.189.7',
    },
    {
        'jp': 'ブイン基地',
        'en': 'Buin',
        'ip': '125.6.189.39',
    },
    {
        'jp': 'タウイタウイ泊地',
        'en': 'Tawi',
        'ip': '125.6.189.71',
    },
    {
        'jp': 'パラオ泊地',
        'en': 'Palau',
        'ip': '125.6.189.103',
    },
    {
        'jp': 'ブルネイ泊地',
        'en': 'Brunei',
        'ip': '125.6.189.135',
    },
    {
        'jp': '単冠湾泊地',
        'en': 'Hitokappu',
        'ip': '125.6.189.167',
    },
    {
        'jp': '幌筵泊地',
        'en': 'Paramushiru',
        'ip': '125.6.189.215',
    },
    {
        'jp': '宿毛湾泊地',
        'en': 'Sukumo',
        'ip': '125.6.189.247',
    },
    {
        'jp': '鹿屋基地',
        'en': 'Kanoya',
        'ip': '203.104.209.23',
    },
    {
        'jp': '岩川基地',
        'en': 'Iwagawa',
        'ip': '203.104.209.39',
    },
    {
        'jp': '佐伯湾泊地',
        'en': 'Saiki',
        'ip': '203.104.209.55',
    },
    {
        'jp': '柱島泊地',
        'en': 'Hashirajima',
        'ip': '203.104.209.102',
    }]

const lastState = {}
const queue = []

for (let s of servers) {
    if (lastState[s.en] == undefined) {
        lastState[s.en] = true
    }
}

function test() {
    setTimeout(() => test(), 15 * 1000)
    setTimeout(() => tweetQueue(), 12500)

    for (let s of servers) {
        testServer(s.ip, (up) => {
            let d = new Date()
            d.setTime(d.getTime() + 60 * 1000 * (d.getTimezoneOffset() + (9 * 60)))

            if (LOG_ENABLE) console.log(`${s.en}\t${up}`)
            if (lastState[s.en] != up) {
                queue.push(`${up ? '📈' : '📉'} ${s.jp} (${s.en}): ${up ? 'online' : 'offline'} @ ${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}`)
            }
            lastState[s.en] = up
        })
    }
}

function tweetQueue() {
    if (LOG_ENABLE) console.log('Tweeting ' + queue.length + ' lines')
    let currentTweet = ''
    while (queue.length > 0) {
        let newTweet = queue.pop()
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
    if (LOG_ENABLE) console.log('Trying ' + server)
    let options = { method: 'HEAD', host: server, port: 80, path: '/', timeout: 7500 }
    let req = http.request(options, async function (res) {
        if (LOG_ENABLE) console.log(server, res.statusCode)
        callback(true)
    })
    req.on('socket', function (socket) {
        socket.setTimeout(7500)
        socket.on('timeout', function () {
            req.abort()
        })
    })
    req.on('error', () => callback(false))
    req.end()
}

function sendTweet(msg) {
    sendDiscord(msg)
    let tweet = {
        status: msg,
    }
    T.post('statuses/update', tweet, function (e, d, r) {
        if (e) {
            if (LOG_ENABLE) console.log(e)
        } else if (LOG_ENABLE) {
            console.log('Tweeted ' + JSON.stringify(d))
        }
    })
}

function sendDiscord(msg, close) {
    let payload = { 'content': msg }
    request({
        url: process.env.KCSERVERWATCHER_DISCORD_WEBHOOK,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }, (e, r, b) => {
        if (e && LOG_ENABLE) console.log(e)
        if (close) process.exit()
    })
}

module.exports = {
    start() {
        if (LOG_ENABLE) console.log('Running KC server watcher...')
        sendDiscord('Starting...')
        test()
    },
}
