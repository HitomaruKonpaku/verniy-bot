const { RichEmbed } = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
const he = require('he')
const Settings = require('../settings')
const Logger = require('./Logger')
const TwitterClient = require('./TwitterClient')
const CronKC = require('./CronKC')
const Util = require('./Util')

class DiscordClient {
    constructor() {
        Logger.log('DISCORD constructor')
        // Get variables for client
        this.startSubModule = false
        this.token = process.env.DISCORD_TOKEN_BOT
        this.owner = process.env.DISCORD_OWNER ? process.env.DISCORD_OWNER.split(',') : ['153363129915539457']
        this.commandPrefix = process.env.DISCORD_PREFIX || '.'
        this.commandEditableDuration = 20
        this.nonCommandEditable = false
        this.unknownCommandResponse = false
        //
        if (this.token === undefined) {
            Logger.warn('DISCORD Missing token')
            return
        }
        // Init client
        this.client = new Commando.Client({
            owner: this.owner,
            commandPrefix: this.commandPrefix,
            commandEditableDuration: this.commandEditableDuration,
            nonCommandEditable: this.nonCommandEditable,
            unknownCommandResponse: this.unknownCommandResponse,
        })
        // Client events
        this.client
            // Emitted when the client becomes ready to start working
            .on('ready', () => {
                this.runOnReady()
            })
            // Emitted whenever the client tries to reconnect to the WebSocket
            .on('reconnecting', () => {
                Logger.log('RECONNECTING')
            })
            // Emitted for general debugging information
            .on('debug', info => {
                // Skip
                if ([
                    'Authenticated using token',
                    'Sending a heartbeat',
                    'Heartbeat acknowledged',
                ].some(v => info.indexOf(v) != -1)) {
                    return
                }
                // Format
                info = info.replace(/\.$/, '')
                Logger.debug(info)
            })
            // Emitted for general warnings
            .on('warn', info => {
                info = info.replace(/\.$/, '')
                Logger.warn(info)
            })
            // Emitted whenever the client's WebSocket encounters a connection error
            .on('error', error => {
                Logger.error(error)
            })
            // Emitted whenever a WebSocket resumes
            .on('resume', () => {
                Logger.log('RESUME')
            })
            // Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect
            .on('disconnect', () => {
                Logger.warn('DISCONNECT')
            })
            // Emitted whenever a message is created
            .on('message', msg => {
                // Ingore bot incoming message
                if (msg.author.bot) {
                    return
                }

                // Autism
                const content = msg.content
                const wave = '👋'
                if (content === wave) {
                    msg.channel.send(wave)
                }
            })
            .on('guildCreate', guild => {
                Logger.log(`GUILD JOINED: ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })
            .on('guildDelete', guild => {
                Logger.log(`GUILD LEAVE : ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })
            .on('guildUnavailable', guild => {
                Logger.log(`GUILD UNAVAILABLE: ${guild.name} at ${new Date().toCustomString(Settings.Global.TimezoneOffset)}`)
            })

        // Client registries
        this.client.registry
            .registerDefaultTypes()
            .registerGroups([
                ['dev', 'Developer'],
                ['util', 'Utility'],
                ['user', 'User'],
                ['guild', 'Guild'],
                ['kc', 'KanColle'],
                ['fun', 'Funny'],
            ])
            .registerCommandsIn(path.join(__dirname, '..', 'commands'))
    }
    start() {
        this.client
            .login(this.token)
            .catch(err => Logger.error(err.message))
    }
    runOnReady() {
        //
        Logger.log(`DISCORD ${this.client.user.tag} READY!!!`)
        this.client.user.setActivity(`Type ${this.commandPrefix}help for help`, { type: 'PLAYING' })
        //
        Logger.log('Owners')
        this.client.owners
            .filter(v => v !== undefined)
            .forEach(v => {
                Logger.log(`- ${v.id} > ${v.tag}`)
            })
        //
        const cmd = Util.getDiscordCommandWithID(this.client, 'guild')
        if (cmd) cmd.run()
        //
        if (this.startSubModule === true) return
        this.startSubModule = true
        //
        this.startTwitter()
        this.startCron()
    }
    sendAsBot({ channels, message, embed }) {
        if ((channels || []).length === 0) return
        const client = this.client
        const channelSet = new Set(channels)
        client.channels
            .filterArray(v => v.type === 'text' && channelSet.has(v.id))
            .forEach(v => v
                .send(message, embed)
                .then(() => Logger.log(`DONE > ${v.guild.name} > #${v.name}`))
                .catch(err => {
                    const code = err.code
                    const message = err.message
                    if (code === 50013 || message === 'Missing Permissions') {
                        Logger.warn(`Missing Permissions > Send Message > ${v.guild.name} > #${v.name}`)
                        return
                    }
                    if (code || message) {
                        Logger.warn(`${code} > ${message}`)
                        return
                    }
                    Logger.warn(err)
                })
            )
    }
    sendAsUser({ channels, message, embed }) {
        if ((channels || []).length === 0) return
        const token = process.env.DISCORD_TOKEN_USER
        if (token === undefined) return
        const Discord = require('discord.js')
        const client = new Discord.Client()
        const channelSet = new Set(channels)
        const sendTotal = channels.length
        let sendCount = 0
        client.on('ready', () => {
            Logger.log(`DISCORD ${client.user.tag} READY!!!`)
            client.channels
                .filterArray(v => v.type === 'text' && channelSet.has(v.id))
                .forEach(v => v
                    .send(message, embed)
                    .then(() => Logger.log(`DONE > ${v.guild.name} > #${v.name}`))
                    .catch(err => Logger.error(err))
                    .then(() => {
                        sendCount++
                        if (sendCount !== sendTotal) return
                        Logger.log('DISCORD Disconnecting as user!')
                        client
                            .destroy()
                            .then(() => Logger.log('DISCORD Disconnected!'))
                    })
                )
        })
        Logger.log('DISCORD Connecting as user!')
        client.login(token)
    }
    startTwitter() {
        const isEnable = process.env.TWITTER_ENABLE
        if (!(isEnable === '1' || isEnable === 'true')) return

        // #region Local functions

        const decodeNewTweet = raw => {
            if (!Array.isArray(raw)) return {}
            const data = {}
            raw.forEach(v => {
                Array(...v.follows).forEach(id => {
                    if (data[id]) {
                        data[id].channels = data[id].channels.concat(v.channels)
                        return
                    }
                    data[id] = {
                        channels: v.channels || [],
                        retweet: v.retweet,
                        media: v.media,
                    }
                })
            })
            return data
        }

        const makeTweetEmbed = tweet => {
            const embed = new RichEmbed({
                color: parseInt(tweet.user.profile_background_color || '1DA1F2', 16),
                author: {
                    name: `${tweet.user.name} (@${tweet.user.screen_name})`,
                    url: `https://twitter.com/${tweet.user.screen_name}`,
                    icon_url: tweet.user.profile_image_url_https,
                },
                timestamp: new Date(),
                footer: {
                    text: 'Twitter',
                    icon_url: 'http://abs.twimg.com/icons/apple-touch-icon-192x192.png',
                },
            })

            let description = tweet.text
            let media

            try {
                if (tweet.extended_tweet) {
                    const ex = tweet.extended_tweet
                    if (ex.full_text) {
                        description = ex.full_text
                    }
                    if (ex.entities.media) {
                        media = ex.entities.media[0].media_url_https
                    }
                } else if (tweet.entities.media) {
                    media = tweet.entities.media[0].media_url_https
                }
                if (!media && tweet.quoted_status) {
                    const qs = tweet.quoted_status
                    if (qs.extended_tweet) {
                        const ex = qs.extended_tweet
                        media = ex.entities.media[0].media_url_https
                    } else if (tweet.quoted_status.entities.media) {
                        media = qs.entities.media[0].media_url_https
                    }
                }
            } catch (err) {
                Logger.warn(err)
            }

            // Fix special char e.g. '&amp;' to '&'
            description = he.decode(description)

            embed.setDescription(description)
            embed.setImage(media)
            return embed
        }

        // #endregion

        // #region Variables

        const twitter = new TwitterClient()
        const newAvatarData = Settings.Twitter.NewAva
        const newTweetData = decodeNewTweet(Settings.Twitter.NewTweet)
        const newTweetFollowList = Object.keys(newTweetData)
        const newTweetFollowSet = new Set(newTweetFollowList)

        // #endregion

        twitter.checkAvatar(newAvatarData)
        twitter.checkTweet(newTweetFollowList)

        twitter
            .on('tweet', tweet => {
                const uid = tweet.user.id_str
                const udata = newTweetData[uid]
                // Check tweet source user
                if (!newTweetFollowSet.has(uid)) return
                // Check retweet
                if (udata.retweet !== undefined && udata.retweet === !tweet.retweeted_status) return
                // Check media
                if (udata.media !== undefined && udata.media === !tweet.entities.media) return
                // Send tweet
                const channels = udata.channels
                const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
                Logger.log(`TWITTER TWEET ${url}`)
                const message = url
                const embed = makeTweetEmbed(tweet)
                this.sendAsBot({ channels, message, embed })
                // KanColle New Info Only
                this.checkKanColleNewInfo(tweet)
            })
            .on('avatar', user => {
                const imgSrc = user.profile_image_url_https
                if (!imgSrc) return
                const imgFull = imgSrc.replace('_normal', '')
                Logger.log(`TWITTER AVATAR @${user.screen_name} > ${imgFull}`)
                const uid = user.id_str
                const channels = newAvatarData[uid].channels
                this.sendAsBot({ channels, message: imgFull })
                const channels2 = newAvatarData[uid].channelsAsUser
                this.sendAsUser({ channels: channels2, message: imgFull })
            })
    }
    checkKanColleNewInfo(tweet) {
        const users = ['3383309523']
        const channels = [
            // // hito nuke > other
            // '462085619691290624',
            // // // kc-only
            // // '425302689887289344',
            // // vnkc > chat
            // '442409008788275200',
            // // dsz > general
            // '363267356308406272',
        ]
        // const users = ['2591243785']
        // const channels = ['462085619691290624']
        const uid = tweet.user.id_str
        if (!users.includes(uid)) return
        const pattern = 'Detected new'
        if (!tweet.text.includes(pattern)) return
        const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
        const media = tweet.extended_entities
            ? tweet.extended_entities.media
            : tweet.extended_tweet.extended_entities
                ? tweet.extended_tweet.extended_entities.media
                : []
        const message = [url, ...media.slice(1).map(v => v.media_url_https + ':orig')].join('\n')
        Logger.log(message)
        this.sendAsUser({ channels, message })
    }
    startCron() {
        const isEnable = process.env.CRON_ENABLE
        if (!(isEnable === '1' || isEnable === 'true')) return

        Logger.log('CRON Starting...')
        const cron = new CronKC()
        cron.on('message', msg => {
            Logger.log(`CRON Message: ${msg}`)
            const channels = Settings.Cron.KanColle
            this.sendAsBot({ channels, message: msg })
        })
        cron.start()
    }
}

module.exports = DiscordClient