const { RichEmbed } = require('discord.js')
const Twitter = require('twitter')
const TwitterSettings = require('../settings').Twitter
const Util = require('./Util')
const Logger = require('./Logger')

class TwitterClient {
    constructor() {
        Logger.log('TwitterClient constructor')
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
        const api = 'statuses/filter'

        const makeEmbed = tweet => {
            let embed = new RichEmbed({
                color: 0x1da1f2,
                author: {
                    name: `${tweet.user.name} (@${tweet.user.screen_name})`,
                    url: `https://twitter.com/${tweet.user.screen_name}`,
                    icon_url: tweet.user.profile_image_url_https,
                },
                footer: {
                    text: 'Twitter',
                    icon_url: 'http://abs.twimg.com/icons/apple-touch-icon-192x192.png',
                }
            })
            let description = tweet.text
            let media

            if (tweet.extended_tweet) {
                if (tweet.extended_tweet.full_text) {
                    description = tweet.extended_tweet.full_text
                }
                if (tweet.extended_tweet.entities.media) {
                    media = tweet.extended_tweet.entities.media[0].media_url_https
                }
            } else {
                if (tweet.entities.media) {
                    media = tweet.entities.media[0].media_url_https
                }
            }

            description = description.replace(/(https{0,1}:\/\/t\.co\/\w+)$/, '').trim()
            embed.setDescription(description)
            embed.setImage(media)

            return embed
        }

        const streamStart = () => {
            Logger.log(`Checking new tweet from ${followList.join(', ')}`)
            this.client.stream(api, {
                follow: followList.join(',')
            }, stream => {
                stream.on('data', tweet => {
                    const processTweet = tweet => {
                        // Tweet url
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
                        Logger.log(`Tweet: ${url}`)
                        const embed = makeEmbed(tweet)
                        const sendList = Util.getTwitterFollowBroadcast(TwitterSettings.NewTweet[tweet.user.id_str])
                        Util.getDiscordBroadcastChannel(discord, sendList)
                            .forEach(v => {
                                v.send(url, embed)
                                    .then(() => Logger.log(`Done: ${v.guild.name} / ${v.name}`))
                            })
                    }
                    processTweet(tweet)
                })
                stream.on('error', err => {
                    Logger.error(err)
                    // Reconnect
                    const retryInMinute = 10
                    Logger.log(`Reconnect to ${api} in ${retryInMinute} minutes`)
                    setTimeout(() => streamStart(), 60000 * retryInMinute)
                })
            })
        }

        streamStart()
    }
    checkNewAva({ discord }) {
        Logger.log(`Checking new twitter avatar`)
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
                Logger.log(`${client.user.tag} READY!!!`)
                let channels = Util.getDiscordBroadcastChannel(client, [
                    '425302689887289344',
                ])
                channels.forEach(v => {
                    v.send(image)
                        .then(() => Logger.log(`Done: ${v.guild.name} / ${v.name}`))
                        .catch(() => { })
                        .then(() => {
                            Logger.log('Disconnecting from Discord as user!')
                            client.destroy()
                                .then(() => {
                                    Logger.log('Disconnected!')
                                })
                        })
                })
            })
            Logger.log('Connecting to Discord as user!')
            client.login(token)
        }
        // Check
        followList.forEach(id => {
            // 
            Logger.log(`Checking ava of ${id}`)
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
                        Logger.log(`Ava: ${img}`)
                        const sendList = Util.getTwitterFollowBroadcast(TwitterSettings.NewAva[id])
                        Util.getDiscordBroadcastChannel(discord, sendList)
                            .forEach(v => {
                                v.send(img)
                                    .then(() => Logger.log(`Done: ${v.guild.name} / ${v.name}`))
                            })
                        // DO THIS ONLY WHEN USER IS @KanColle_STAFF
                        if (id == '294025417') {
                            specialSend(img)
                        }
                        // Save new ava
                        ava = img
                    })
                    .catch(err => {
                        Logger.error(err)
                    })
            }
            // Start to check
            follow()
            setInterval(() => { follow() }, 1000 * data.interval)
        })
    }
}

module.exports = TwitterClient