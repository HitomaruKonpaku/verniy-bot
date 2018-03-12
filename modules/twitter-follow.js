const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')

var client = new Twitter()

module.exports = {
    init: ({ ConsumerKey, ConsumerSecret, AccessToken, AccessTokenSecret }) => {
        client.consumer_key = ConsumerKey
        client.consumer_secret = ConsumerSecret
        client.access_token_key = AccessToken
        client.access_token_secret = AccessTokenSecret
    },
    follow: ({ discord, follows, broadcastChannels }) => {
        client.stream('statuses/filter', {
            follow: follows.join(',')
        }, stream => {
            // Handle successful
            stream.on('data', tweet => {
                    var link = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                    if (!(new Set(follows).has(tweet.user.id_str))) {
                        return
                    }
                    var broadcastChannels = new Set(broadcastChannels)
                    var listChannels = discord.channels
                    var receiver = listChannels.filterArray(v => v.type == 'text' && broadcastChannels.has(v.id))
                    console.log(`RT: ${link}`)
                    receiver.forEach(v => { v.send(link) })
                })
                // Handle error
            stream.on('error', error => {
                console.log(error)
            })
        })
    }
}