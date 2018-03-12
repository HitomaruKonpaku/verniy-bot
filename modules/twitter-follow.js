const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')

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

    // Make tweet link
    const link = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

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
}

module.exports = {
    init: ({ ConsumerKey, ConsumerSecret, AccessToken, AccessTokenSecret }) => {
        client = new Twitter({
            consumer_key: ConsumerKey,
            consumer_secret: ConsumerSecret,
            access_token_key: AccessToken,
            access_token_secret: AccessTokenSecret,
        })
    },
    follow: ({ discord, follows }) => {
        // Module helper
        if (followData != undefined) return
        initData(follows)

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
    }
}