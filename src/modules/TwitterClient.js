const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')
const TwitterSettings = require('../settings').Twitter
const Util = require('./Util')

class TwitterClient {
    constructor() {
        // 
        const ConsumerKey = process.env.TWITTER_CONSUMER_KEY
        const ConsumerSecret = process.env.TWITTER_CONSUMER_SECRET
        const AccessToken = process.env.TWITTER_ACCESS_TOKEN
        const AccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

        // 
        this.client = new Twitter({
            consumer_key: ConsumerKey,
            consumer_secret: ConsumerSecret,
            access_token_key: AccessToken,
            access_token_secret: AccessTokenSecret,
        })
    }
    checkNewTweet({ discord }) {
        // 
        const followList = Util.getTwitterFollow(TwitterSettings.NewTweet)
        const followSet = new Set(followList)
        // 
        this.client.stream('statuses/filter', {
            follow: followList.join(',')
        }, stream => {
            stream.on('data', tweet => {
                const processTweet = tweet => {
                    // 
                    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                    // Check tweet source user
                    if (!followSet.has(tweet.user.id_str)) {
                        return
                    }
                    // Check retweeted
                    if (tweet.retweeted_status) {
                        return
                    }
                    // Send
                    console.log(`Tweet: ${url}`)
                    const sendList = Util.getTwitterFollowBroadcast(TwitterSettings.NewTweet[tweet.user.id_str])
                    Util.getDiscordBroadcastChannel(discord, sendList)
                        .forEach(v => {
                            v.send(url)
                                .then(() => console.log(`Done: ${v.guild.name} / ${v.name}`))
                        })
                }
                processTweet(tweet)
            })
            stream.on('error', err => {
                console.trace(err)
            })
        })
    }
    checkNewAva({ discord }) {
        // Declare
        const api = 'users/show'
        const followList = Util.getTwitterFollow(TwitterSettings.NewAva)
        // Special send as Discord user
        const specialSend = image => {
            // Discord user token
            const token = process.env.DISCORD_TOKEN_USER
            if (!token) {
                return
            }
            // 
            const Discord = require('discord.js')
            const client = new Discord.Client()
            client.on('ready', () => {
                console.log(`${client.user.tag} READY!!!`)
                let channels = Util.getDiscordBroadcastChannel(client, [
                    '425302689887289344',
                ])
                channels.forEach(v => {
                    v.send(image)
                        .then(() => console.log(`Done: ${v.guild.name} / ${v.name}`))
                        .catch(() => { })
                        .then(() => {
                            console.log('Disconnecting from Discord as user!')
                            client.destroy()
                                .then(() => {
                                    console.log('Disconnected!')
                                })
                        })
                })
            })
            console.log('Connecting to Discord as user!')
            client.login(token)
        }
        // Check
        followList.forEach(id => {
            // 
            const data = TwitterSettings.NewAva[id]
            let ava
            // 
            const follow = () => {
                this.client
                    .get(api, {
                        user_id: id,
                        include_entities: false,
                    })
                    .then(user => {
                        const img = user.profile_image_url_https.replace('_normal', '')
                        // Pre check
                        if (!ava) {
                            ava = img
                            return
                        }
                        if (ava == img) {
                            return
                        }
                        // Send
                        const sendList = Util.getTwitterFollowBroadcast(TwitterSettings.NewAva[id])
                        Util.getDiscordBroadcastChannel(discord, sendList)
                            .forEach(v => {
                                v.send(img)
                                    .then(() => console.log(`Done: ${v.guild.name} / ${v.name}`))
                            })
                        // DO THIS ONLY WHEN USER IS @KanColle_STAFF
                        if (id == '294025417') {
                            specialSend(img)
                        }
                        // Save new ava
                        ava = img
                    })
            }
            // Start to check
            follow()
            setInterval(() => { follow() }, 1000 * data.interval)
        })
    }
}

module.exports = TwitterClient