const EventEmitter = require('events')
const Twitter = require('twit')
const Logger = require('./Logger')

class TwitterClient extends EventEmitter {
    constructor() {
        super()
        Logger.log('TwitterClient constructor')
        //
        const ConsumerKey = process.env.TWITTER_CONSUMER_KEY
        const ConsumerSecret = process.env.TWITTER_CONSUMER_SECRET
        const AccessToken = process.env.TWITTER_ACCESS_TOKEN
        const AccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET
        //
        let check = true
        if (ConsumerKey === undefined) {
            console.log('Missing ConsumerKey')
            check = false
        }
        if (ConsumerSecret === undefined) {
            console.log('Missing ConsumerSecret')
            check = false
        }
        if (AccessToken === undefined) {
            console.log('Missing AccessToken')
            check = false
        }
        if (AccessTokenSecret === undefined) {
            console.log('Missing AccessTokenSecret')
            check = false
        }
        if (!check) {
            return
        }
        //
        this.client = new Twitter({
            consumer_key: ConsumerKey,
            consumer_secret: ConsumerSecret,
            access_token: AccessToken,
            access_token_secret: AccessTokenSecret,
        })
    }
    isAvailable() {
        return this.client !== undefined
    }
    checkTweet(users) {
        if (!this.isAvailable() || !Array.isArray(users)) {
            return
        }
        const twitter = this
        const api = 'statuses/filter'
        const params = {
            follow: users.join(','),
        }
        const stream = this.client.stream(api, params)
        stream
            .on('connect', req => {
                console.log('Connecting...')
            })
            .on('connected', res => {
                console.log('Connected')
            })
            .on('reconnect', (req, res, interval) => {
                console.log('Reconnecting...')
            })
            .on('disconnect', msg => {
                console.log('Disconnected')
                console.log(msg)
                stream.start()
            })
            .on('warning', warn => {
                console.log('Warning')
                console.log(warn)
            })
            .on('error', err => {
                console.log('Error')
                console.log(err)
            })
            .on('tweet', tweet => {
                twitter.emit('tweet', tweet)
            })
            .on('limit', msg => {
                console.log('Limit')
                console.log(msg)
            })
    }
    checkAvatar(users) {
        if (!this.isAvailable()) {
            return
        }
        const twitter = this
        const api = 'users/show'
        const uidList = Object.keys(users)
        uidList.forEach(id => {
            const interval = users[id].interval
            let ava
            const check = () => {
                this.client
                    .get(api, { user_id: id, include_entities: false })
                    .then(data => {
                        const user = data.data
                        const img = user.profile_image_url_https
                        // Pre check
                        if (ava === undefined) {
                            ava = img
                            return
                        }
                        if (ava === img) {
                            return
                        }
                        // Save new ava
                        ava = img
                        //
                        twitter.emit('avatar', user)
                    })
                    .catch(err => {
                        Logger.error(err)
                    })
            }
            // Start to check
            check()
            setInterval(() => {
                check()
            }, 1000 * interval)
        })
    }
    checkRateLimit() {
        const api = 'application/rate_limit_status'
        return this.client.get(api, {
            resources: [
                'users',
            ].join(','),
        })
    }
}

module.exports = TwitterClient