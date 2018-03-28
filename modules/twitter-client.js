const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')
const Logger = require('../modules/logger')

// GLOBAL VAR
var client
var followData
var followUsers

function initData(data) {
    followData = data
    followUsers = new Set()
    for (const key in data) {
        followUsers.add(key)
    }
}

function getFollowString() {
    var s = Array.from(followUsers).join(',')
    return s
}

function getBroadcastChannels(user) {
    var channels = new Set()
    for (const key in followData[user]) {
        channels.add(key)
    }
    return channels
}

function handleReceivedTweet(discord, tweet) {
    // Make tweet link
    const link = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    Logger.log(`Tweet: ${link}`)

    // Check tweet source user
    if (!followUsers.has(tweet.user.id_str)) {
        return
    }
    // Check retweeted
    if (tweet.retweeted_status) {
        return
    }
    // Check tweet contain media
    if (tweet.extended_entities) {
        // TODO
    }

    // Filter channel to be send
    const channelDiscord = discord.channels
    const channelSetting = getBroadcastChannels(tweet.user.id_str)
    const channelReceive = channelDiscord.filterArray(v =>
        v.type == 'text'
        && channelSetting.has(v.id)
    )

    // Send to all channel
    Logger.log('Broadcasting...')
    channelReceive.forEach(v => { v.send(link) })
    Logger.log('Broadcast completed')
}

module.exports = {
    init: ({ ConsumerKey, ConsumerSecret, AccessToken, AccessTokenSecret }) => {
        client = new Twitter({
            consumer_key: ConsumerKey,
            consumer_secret: ConsumerSecret,
            access_token_key: AccessToken,
            access_token_secret: AccessTokenSecret,
        })
        Logger.log('Twitter API init completed')
    },
    follow: ({ discord, follows }) => {
        // Module helper
        if (followData != undefined) return
        initData(follows)

        Logger.log(`Following ${getFollowString()}`)

        // Start twitter stream
        client.stream('statuses/filter', {
            follow: getFollowString()
        }, stream => {
            // Handle successful
            stream.on('data', tweet => {
                handleReceivedTweet(discord, tweet)
            })
            // Handle error
            stream.on('error', error => {
                Logger.error(error)
            })
        })
    },
    followAva: ({ discord }) => {
        // @HitomaruKonpaku
        // const userID = '2591243785'
        // @KanColle_STAFF
        const userID = '294025417'
        const channel2Send = getBroadcastChannels(userID)

        // Check interval
        const envInterval = process.env.TWITTER_API_USER_PROFILE_INTERVAL
        Logger.log(`Environment interval: ${envInterval}`)
        const checkInterval = Number(envInterval) || 30
        Logger.log(`Assigned interval: ${checkInterval}`)

        // Var
        var savedImage

        function runAPI() {
            const api = 'users/show'
            Logger.log(`Requesting ${api}`)

            client
                .get(api, {
                    user_id: userID,
                    include_entities: false,
                })
                .then(tweet => {
                    // Get the image link
                    var img = tweet.profile_image_url_https.replace('_normal', '')
                    Logger.log(`Avatar: ${img}`)

                    if (savedImage != undefined &&
                        savedImage != img &&
                        img != '') {
                        var channels = discord.channels.filterArray(v =>
                            v.type == 'text' &&
                            channel2Send.has(v.id)
                        )
                        Logger.log('Broadcasting...')
                        channels.forEach(v => { v.send(img) })
                        Logger.log('Broadcast completed')
                    }

                    // Save the new image
                    savedImage = img
                })
                .catch(error => {
                    Logger.error(error)
                })
        }

        // First run
        runAPI()

        // Interval run
        setInterval(() => {
            runAPI()
        }, 1000 * checkInterval)
    },
    rateLimit: () => {
        client
            .get('application/rate_limit_status', {
                resources: [
                    'users'
                ].join(','),
            })
            .then(data => {
                Logger.debug(data)
            })
            .catch(error => {
                Logger.error(error)
            })
    },
}