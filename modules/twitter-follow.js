const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')

var client

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
        client.stream('statuses/filter', {
            follow: '2591243785,294025417'
        }, stream => {
            // Handle successful
            stream.on('data', tweet => {
                    var link = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                        // if (!(new Set(follows).has(tweet.user.id_str))) {
                        //     return
                        // }
                        // var broadcastChannels = new Set(broadcastChannels)
                    var listChannels = discord.channels
                    var receiver = listChannels
                        .filterArray(v =>
                            v.type == 'text' &&
                            v.id == '422709303376609290'
                        )
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