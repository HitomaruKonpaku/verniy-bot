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
            Util.broadcastDiscordChannels(discord, sendList, url, embed)
        }

        const streamStart = () => {
            Logger.log(`Checking new tweet from ${followList.join(', ')}`)
            let isError = undefined
            const retryInMin = 5
            const retryInSec = 1

            this.client.stream(api, {
                follow: followList.join(',')
            }, stream => {
                stream.on('data', tweet => {
                    if (isError == undefined || isError == true)
                        Logger.log(`Twitter API ${api} connected`)
                    isError = false
                    processTweet(tweet)
                })
                stream.on('error', err => {
                    if (isError == true) return
                    isError = true
                    Logger.error(err)
                    Logger.log(`Reconnect to ${api} in ${retryInMin} minutes`)
                    setTimeout(() => streamStart(), 60000 * retryInMin)
                })
                stream.on('end', () => {
                    if (isError == true) return
                    Logger.log(`Stream API ended. Reconnect in ${retryInSec} seconds`)
                    setTimeout(() => streamStart(), 1000 * retryInSec)
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
        const specialSend = (channels, image) => {
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
                let sendList = Util.getDiscordBroadcastChannel(client, channels)
                let total = channels.length
                let done = 0
                sendList.forEach(v => {
                    v.send(image)
                        .then(() => Logger.log(`Done: ${v.guild.name} > ${v.name}`))
                        .catch(err => Logger.error(err))
                        .then(() => {
                            done++
                            if (done != total) {
                                return
                            }
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
            // Vars
            const data = TwitterSettings.NewAva[id]
            const interval = data.interval
            let ava
            // Pre-check
            if (!interval) {
                Logger.warn(`Missing check interval! Skipped ${id}`)
                return
            } else {
                Logger.log(`Checking ava of ${id}, interval ${interval}s`)
            }
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
                        // Send as bot
                        Logger.log(`Ava: ${img}`)
                        const sendList = data.channels
                        Util.broadcastDiscordChannels(discord, sendList, img)
                        // Send as user
                        if (data.channelsAsUser && data.channelsAsUser.length > 0) {
                            specialSend(data.channelsAsUser, img)
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
            setInterval(() => { follow() }, 1000 * interval)
        })
    }
}

module.exports = TwitterClient