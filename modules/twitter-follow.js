const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')

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
    console.log(`GET: ${link}`)

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

    // Log
    console.log(`RT: ${link}`)

    // Send to all channel
    channelReceive.forEach(v => { v.send(link) })
    console.log(`BROADCAST: Completed`)
}

module.exports = {
    init: ({ ConsumerKey, ConsumerSecret, AccessToken, AccessTokenSecret }) => {
        client = new Twitter({
            consumer_key: ConsumerKey,
            consumer_secret: ConsumerSecret,
            access_token_key: AccessToken,
            access_token_secret: AccessTokenSecret,
        })
        console.log('INIT: Completed')
    },
    follow: ({ discord, follows }) => {
        // Module helper
        if (followData != undefined) return
        initData(follows)

        // Log
        console.log(`TRACE: Following ${getFollowString()}`)

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
                console.log(error)
            })
        })
    },
    followAva: ({ discord }) => {
        // @HitomaruKonpaku
        // const userID = '2591243785'
        // @KanColle_STAFF
        const userID = '294025417'
        const channel2Send = getBroadcastChannels(userID)

        // Var
        var savedImage

        function runAPI() {
            console.log('TRACE: Requesting users/show...')
            client.get('users/show', {
                user_id: userID,
                include_entities: false,
            }, (error, tweet) => {
                // Get the image link
                var img = tweet.profile_image_url_https.replace('_normal', '')
                console.log(`AVA: ${link}`)

                if (savedImage != undefined &&
                    savedImage != img &&
                    img != '') {
                    var channels = discord.channels.filterArray(v =>
                        v.type == 'text' &&
                        channel2Send.has(v.id)
                    )
                    channels.forEach(v => { v.send(img) })
                    console.log(`BROADCAST: Completed`)
                }

                // Save the new image
                savedImage = img
            })
        }

        // First run
        runAPI()

        // Interval run
        setInterval(() => {
            runAPI()
        }, 1000 * 60)
    },
    rateLimit: () => {
        return client.get('application/rate_limit_status')
    },
}