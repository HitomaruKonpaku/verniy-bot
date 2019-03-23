const EventEmitter = require('events')
const { promisify } = require('util')

require('./Prototype')
const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')

class FacebookClient extends EventEmitter {

  constructor() {
    super()
    Logger.log('FACEBOOK constructor')
    //
    this.FB.setVersion(ConfigVar.SETTINGS.Facebook.GraphAPI.Version)
  }

  get FB() { return require('fbgraph') }

  checkPages(pages) {
    const token = ConfigVar.FACEBOOK_ACCESS_TOKEN
    if (!token) return
    if (!pages) return
    Logger.log('FACEBOOK PAGES ENABLED')
    //
    const self = this
    const fbGet = promisify(this.FB.get)
    const pidList = Object.keys(pages)
    Logger.log('FACEBOOK PAGES Checking feed from: ' + pidList.join(', '))
    pidList.forEach(checkPage)
    //
    async function checkPage(id) {
      const interval = Number(pages[id].interval)
      if (isNaN(interval)) return
      // Fetch page basic info
      const page = { id }
      try {
        const params = {
          access_token: token,
          fields: 'id,name,picture'
        }
        const res = await fbGet(id, params)
        Object.keys(res).forEach(v => { page[v] = res[v] })
      } catch (err) {
        Logger.error(err)
        return
      }
      //
      let unix = new Date().getUnixTime()
      //
      await check()
      setInterval(await check, 1000 * interval)
      //
      async function check() {
        const url = id + '/feed'
        const params = {
          access_token: token,
          fields: 'message,created_time,permalink_url,full_picture',
          since: unix || new Date().getUnixTime()
        }
        try {
          const res = await fbGet(url, params)
          // Refresh time filter
          const unix_new = new Date().getUnixTime()
          unix = unix_new
          //
          const posts = res.data
          if (!posts.length) return
          page.posts = posts
          self.emit('page', page)
        } catch (err) {
          Logger.error(err)
        }
      }
    }
  }

}

module.exports = new FacebookClient()
