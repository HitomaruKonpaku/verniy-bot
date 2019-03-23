const EventEmitter = require('events')
const Twitter = require('twit')

const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')
const Helper = require('./TwitterHelper')

class TwitterClient extends EventEmitter {

  constructor() {
    super()
    Logger.log('TWITTER constructor')
    //
    const consumerKey = ConfigVar.TWITTER_CONSUMER_KEY
    const consumerSecret = ConfigVar.TWITTER_CONSUMER_SECRET
    const accessToken = ConfigVar.TWITTER_ACCESS_TOKEN
    const accessTokenSecret = ConfigVar.TWITTER_ACCESS_TOKEN_SECRET
    //
    let check = true
    if (!consumerKey) {
      Logger.warn('TWITTER_CONSUMER_KEY not found')
      check = false
    }
    if (!consumerSecret) {
      Logger.warn('TWITTER_CONSUMER_SECRET not found')
      check = false
    }
    if (!accessToken) {
      Logger.warn('TWITTER_ACCESS_TOKEN not found')
      check = false
    }
    if (!accessTokenSecret) {
      Logger.warn('TWITTER_ACCESS_TOKEN_SECRET not found')
      check = false
    }
    if (!check) {
      return
    }
    //
    this.client = new Twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token: accessToken,
      access_token_secret: accessTokenSecret
    })
  }

  isClientAvailable() {
    if (this.client !== undefined) {
      return true
    }
    Logger.warn('TWITTER Client is NOT available')
    return false
  }

  async checkTweets(follows) {
    //
    if (!this.isClientAvailable()) return
    if (!follows) return
    //
    Logger.log('TWITTER TWEET ENABLED')
    //
    const self = this
    const client = this.client
    const api = 'statuses/filter'
    const params = { follow: follows.join(',') }
    const stream = client.stream(api, params)
    //
    // eslint-disable-next-line no-unused-vars
    stream.on('connect', req => Logger.log('TWITTER STREAM CONNECT Checking new tweet of ' + follows.join(', ')))
    stream.on('tweet', tweet => self.emit('tweet', tweet))
    stream.on('disconnect', msg => Helper.onDisconnect(msg, stream))
    stream.on('error', Helper.onError)
    stream.on('connected', Helper.onConnected)
    stream.on('reconnect', Helper.onReconnect)
    stream.on('warning', Helper.onWarning)
    stream.on('limit', Helper.onLimit)
  }

  async checkProfiles(setting) {
    //
    if (!this.isClientAvailable()) return
    if (!setting) return
    //
    Logger.log('TWITTER PROFILE ENABLED')
    //
    const self = this
    const client = this.client
    const api = 'users/show'
    const follows = Object.keys(setting).filter(v => setting[v].interval > 0)
    //
    if (!follows.length) return
    Logger.log('TWITTER PROFILE Request per 15 minutes (Max 900): ' + follows.reduce((p, v) => p + 900 / setting[v].interval, 0))
    Logger.log('TWITTER PROFILE User<Interval>: ' + follows.map(v => v + '<' + setting[v].interval + '>').join(', '))
    //
    follows.forEach(async id => {
      //
      const interval = setting[id].interval
      const profile = {}
      //
      await checkProfile()
      setInterval(await checkProfile, 1000 * interval)
      //
      async function checkProfile() {
        try {
          const res = await client.get(api, { user_id: id, include_entities: false })
          const user = res.data
          const avatar = user.profile_image_url_https
          // Init data
          if (!profile.avatar) {
            profile.avatar = avatar
            return
          }
          // Nothing change
          if (profile.avatar === avatar || !avatar) {
            return
          }
          // Save
          profile.avatar = avatar
          // Emit
          self.emit('profile', user)
        } catch (err) {
          // Ignore?
          Logger.error(err)
        }
      }
    })
  }

  async checkRateLimit() {
    //
    if (!this.isClientAvailable()) return
    //
    const api = 'application/rate_limit_status'
    return this.client.get(api, {
      resources: ['users'].join(',')
    })
  }

}

module.exports = new TwitterClient()
