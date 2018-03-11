const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')
const Settings = require('../_data/settings.js')

const client = new Twitter({
    consumer_key: Settings.Twitter.ConsumerKey,
    consumer_secret: Settings.Twitter.ConsumerSecret,
    access_token_key: Settings.Twitter.AccessToken,
    access_token_secret: Settings.Twitter.AccessTokenSecret
})

module.exports = {
    run: (discordClient) => {
        client.stream('statuses/filter', {
            follow: Settings.KanColle.DevTwitterID.join(',')
        }, stream => {
            // Handle successful
            stream.on('data', tweet => {
                if (tweet.retweeted_status != null) return
                var broadcastChannels = new Set(Settings.KanColle.BroadcastChannels)
                var listChannels = discordClient.channels
                var receiver = listChannels.filterArray(v => v.type == 'text' && broadcastChannels.has(v.id))
                var link = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
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