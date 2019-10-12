const logger = require('log4js').getLogger('Twitter')
const EventEmitter = require('events')
const Twit = require('twit')

class Twitter extends EventEmitter {

  constructor() {
    logger.info('Constructor')
    super()
    //
    const consumerKey = AppConst.TWITTER_CONSUMER_KEY
    const consumerSecret = AppConst.TWITTER_CONSUMER_SECRET
    const accessToken = AppConst.TWITTER_ACCESS_TOKEN
    const accessTokenSecret = AppConst.TWITTER_ACCESS_TOKEN_SECRET
    // Check
    let check = true
    if (!consumerKey) {
      logger.warn('TWITTER_CONSUMER_KEY not found')
      check = false
    }
    if (!consumerSecret) {
      logger.warn('TWITTER_CONSUMER_SECRET not found')
      check = false
    }
    if (!accessToken) {
      logger.warn('TWITTER_ACCESS_TOKEN not found')
      check = false
    }
    if (!accessTokenSecret) {
      logger.warn('TWITTER_ACCESS_TOKEN_SECRET not found')
      check = false
    }
    if (!check) {
      return
    }
    // Assign class vars
    this.client = new Twit({
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
    logger.warn('Client is NOT available')
    return false
  }

  async checkTweets(follows) {
    // Precheck
    if (!this.isClientAvailable()) return
    if (!follows) return
    //
    logger.info('CheckTweets >> Enabled')
    const self = this
    const client = this.client
    const api = 'statuses/filter'
    const params = { follow: follows.join(',') }
    const stream = client.stream(api, params)
    // Events
    stream.on('warning', require('./events/twitter/on.warning'))
    stream.on('error', require('./events/twitter/on.error'))
    stream.on('limit', require('./events/twitter/on.limit'))
    stream.on('connect', require('./events/twitter/on.connect')(follows))
    stream.on('connected', require('./events/twitter/on.connected'))
    stream.on('reconnect', require('./events/twitter/on.reconnect'))
    stream.on('disconnect', require('./events/twitter/on.disconnect')(stream))
    stream.on('tweet', require('./events/twitter/on.tweet')(self))
  }

  async checkProfiles(config) {
    // Precheck
    if (!this.isClientAvailable()) return
    if (!config) return
    //
    logger.info('CheckProfiles >> Enabled')
    const self = this
    const client = this.client
    const api = 'users/show'
    const follows = Object.keys(config).filter(v => config[v].interval > 0)
    let isServerDown = false
    //
    if (!follows.length) return
    logger.info('API requests every 15 minutes (Max 900): ' + follows.reduce((p, v) => p + Math.floor(900 / config[v].interval), 0))
    logger.info('User<Interval>: ' + follows.map(v => v + '<' + config[v].interval + '>').join(', '))
    follows.forEach(async id => {
      const interval = config[id].interval
      const profile = {}
      //
      await checkProfile()
      setInterval(await checkProfile, 1000 * interval)
      //
      async function checkProfile() {
        try {
          const res = await client.get(api, { user_id: id, include_entities: false })
          isServerDown = false
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
          self.emit('profileChanged', user)
        } catch (err) {
          // Server down
          if (err.statusCode === 500) {
            if (!isServerDown) {
              logger.warn('Internal Server Error')
              logger.error(err)
            }
            isServerDown = true
            return
          }
          // Unknown error
          if (err.statusCode) {
            logger.warn('StatusCode ' + err.statusCode)
          }
          logger.error(err)
        }
      }
    })
  }

}

module.exports = new Twitter()
