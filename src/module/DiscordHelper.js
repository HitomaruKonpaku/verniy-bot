require('./Prototype')
const Logger = require('./Logger')
const ConfigVar = require('./ConfigVar')
const TwitterClient = require('./TwitterClient')
const FacebookClient = require('./FacebookClient')

class DiscordHelper {

  constructor() {
    this.Twitter = {}
    this.Twitter.Tweet = this.transformTwitterTweetSetting(ConfigVar.SETTINGS.Twitter.Tweet)
    this.Twitter.Profile = this.transformTwitterProfileSetting(ConfigVar.SETTINGS.Twitter.Profile)
  }

  onceReady(client) {
    //
    this.client = client
    ConfigVar.DISCORD_CLIENT_ID = client.user.id
    Logger.log(`DISCORD ${client.user.tag} online!`)
    client.user.setActivity(`Type ${client.commandPrefix}help for help`, { type: 'PLAYING' })
    //
    Logger.log('DISCORD Owners')
    client.owners
      .filter(v => !!v)
      .forEach(v => Logger.log(`- ${v.id} > ${v.tag}`))
    //
    client.registry.commands.filter(v => v.name === 'guild').first().run()
    // Twitter
    if (ConfigVar.TWITTER_ENABLE) {
      if (ConfigVar.TWITTER_PROFILE_ENABLE) {
        const setting = this.Twitter.Profile
        TwitterClient.checkProfiles(setting)
        TwitterClient.on('profile', user => this.onTwitterProfile({ user, setting, discord: client }))
      }
      if (ConfigVar.TWITTER_TWEET_ENABLE) {
        const setting = this.Twitter.Tweet
        const follows = Object.keys(setting)
        TwitterClient.checkTweets(follows)
        TwitterClient.on('tweet', tweet => this.onTwitterTweet({ tweet, setting, discord: client }))
      }
    }
    //  Facebook
    if (ConfigVar.FACEBOOK_ENABLE) {
      const pages = ConfigVar.SETTINGS.Facebook.Pages
      FacebookClient.checkPages(pages)
      FacebookClient.on('page', data => this.onFacebookPagePost({ data, pages, discord: client }))
    }
    // Cron
    if (ConfigVar.CRON_ENABLE) {
      const CronKC = require('./CronKC')
      const channels = ConfigVar.SETTINGS.Cron.KanColle
      CronKC.start()
      CronKC.on('message', msg => {
        Logger.log('CRON Message: ' + msg)
        this.sendMessageAsBot({ discord: client, channels, message: msg })
      })
    }
  }

  onReady() {
    Logger.log('DISCORD READY')
  }

  onReconnecting() {
    Logger.log('DISCORD RECONNECTING')
  }

  onDebug(info) {
    const skipMsg = [
      'Authenticated using token',
      'Sending a heartbeat',
      'Heartbeat acknowledged'
    ]
    if (skipMsg.some(v => info.includes(v))) {
      return
    }
    info = info.replace(/\.$/, '')
    Logger.debug(info)
  }

  onWarn(info) {
    info = info.replace(/\.$/, '')
    Logger.warn(info)
  }

  onError(error) {
    Logger.error(error)
  }

  onResume() {
    Logger.log('DISCORD RESUME')
  }

  onDisconnect() {
    Logger.warn('DISCORD DISCONNECT')
  }

  onMessage(msg) {
    // Ingore bot incoming message
    if (msg.author.bot) {
      return
    }
    //
    const content = msg.content
    const uid = msg.author.id
    const gid = (msg.guild || {}).id
    //
    const kowaiMsg = 'Kowai'
    if (content.includes(kowaiMsg) && (
      (uid === '379177718430040066' && gid === '345295036809740289')
      ||
      (uid === '203518448771399680' && gid === '376294828184567810')
    )) {
      msg.channel.send(kowaiMsg)
      return
    }
    //
    const waveMsg = '👋'
    if (content === waveMsg) {
      msg.channel.send(waveMsg)
    }
  }

  onGuildCreate(guild) {
    Logger.log(`DISCORD GUILD JOINED: ${guild.name} at ${new Date().toCustomString()}`)
  }

  onGuildDelete(guild) {
    Logger.log(`DISCORD GUILD LEAVE : ${guild.name} at ${new Date().toCustomString()}`)
  }

  onGuildUnavailable(guild) {
    Logger.log(`DISCORD GUILD UNAVAILABLE: ${guild.name} at ${new Date().toCustomString()}`)
  }

  getRegisterGroups() {
    return [
      ['dev', 'Developer'],
      ['util', 'Utility'],
      ['kc', 'KanColle'],
      ['fun', 'Funny'],
      ['user', 'User'],
      ['guild', 'Guild']
    ]
  }

  transformTwitterTweetSetting(raw) {
    const o = {}
    raw.forEach(v => v.follows.forEach(follow => {
      // Create follow user object
      if (!o[follow]) { o[follow] = {} }
      // Loop channels object
      Object.keys(v.channels).forEach(channel => {
        // Create channel object
        if (!o[follow][channel]) { o[follow][channel] = {} }
        // Get outer config
        Object.keys(v).filter(v => !['follows', 'channels'].includes(v)).forEach(key => o[follow][channel][key] = v[key])
        // Get inner config
        Object.keys(v.channels[channel]).forEach(key => o[follow][channel][key] = v.channels[channel][key])
      })
    }))
    return o
  }

  transformTwitterProfileSetting(raw) {
    const o = raw
    // Make sure interval exist as number
    Object.keys(o).forEach(v => o[v].interval = Number(o[v].interval))
    return o
  }

  async onTwitterTweet({ tweet, setting, discord }) {
    // Tweet user
    const uid = tweet.user.id_str
    if (!Object.keys(setting).includes(uid)) {
      return
    }
    // Which channels to send?
    const sendChannels = []
    Object.keys(setting[uid]).forEach(cid => {
      const channel = setting[uid][cid]
      // Check reply exist, allow self reply
      if (channel.reply !== undefined) {
        if (channel.reply !== !!tweet.in_reply_to_screen_name && tweet.in_reply_to_screen_name !== tweet.user.screen_name) {
          return
        }
      }
      // Check retweet
      if (channel.retweet !== undefined) {
        if (channel.retweet !== !!tweet.retweeted_status) {
          return
        }
      }
      // Check media
      if (channel.media !== undefined) {
        const media = this.getTweetMediaObject(tweet)
        if (channel.media !== !!media) {
          return
        }
      }
      sendChannels.push(cid)
    })
    // Skip
    if (sendChannels.length === 0) { return }
    // Log
    const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    Logger.log('TWITTER TWEET ' + url)
    const message = url
    this.sendMessageAsBot({ discord, channels: sendChannels, message })
  }

  getTweetMediaObject(tweet) {
    function getRoot(tweet) {
      if (tweet.retweeted_status) {
        return tweet.retweeted_status.extended_tweet || tweet.retweeted_status
      }
      if (tweet.quoted_status) {
        return tweet.quoted_status.extended_tweet || tweet.quoted_status
      }
      return tweet.extended_tweet || tweet
    }
    const root = getRoot(tweet)
    const media = root.entities.media
    return media
  }

  makeTweetEmbed(tweet) {
    function getDescription(tweet) {
      return (tweet.extended_tweet || {}).full_text || tweet.text
    }
    function getMedia(tweet) {
      const media = self.getTweetMediaObject(tweet)
      const mediaUrl = media[0].media_url_https
      return mediaUrl
    }
    //
    const { RichEmbed } = require('discord.js')
    const he = require('he')
    const self = this
    // Init embed object
    const embed = new RichEmbed({
      color: parseInt(tweet.user.profile_background_color || '1DA1F2', 16),
      author: {
        name: `${tweet.user.name} (@${tweet.user.screen_name})`,
        url: `https://twitter.com/${tweet.user.screen_name}`,
        icon_url: tweet.user.profile_image_url_https
      },
      timestamp: new Date(),
      footer: {
        text: 'Twitter',
        icon_url: 'http://abs.twimg.com/icons/apple-touch-icon-192x192.png'
      }
    })
    // Fix special char e.g. '&amp;' to '&'
    const description = he.decode(getDescription(tweet))
    const media = getMedia(tweet)
    embed.setDescription(description)
    embed.setImage(media)
    return embed
  }

  async onTwitterProfile({ user, setting, discord }) {
    const imgSrc = user.profile_image_url_https
    if (!imgSrc) return
    const imgFull = imgSrc.replace('_normal', '')
    Logger.log(`TWITTER AVATAR @${user.screen_name} > ${imgFull}`)
    const uid = user.id_str
    const userSetting = setting[uid]
    const channels = userSetting.channels
    const channels2 = userSetting.channelsAsUser
    this.sendMessageAsBot({ discord, channels, message: imgFull })
    this.sendMessageAsUser({ channels: channels2, message: imgFull })
  }

  async onFacebookPagePost({ data, pages, discord }) {
    const pid = data.id
    const channels = Object.keys(pages[pid].channels)
    const posts = data.posts.reverse()
    Logger.log(`FACEBOOK PAGE <${data.name}> posted ${posts.length} new posts`)
    //
    channels.forEach(async cid => {
      const channel = pages[pid].channels[cid]
      const msgPrefix = channel.prefix || ''
      const msgSuffix = channel.suffix || ''
      // Use "for" in order to send posts by time order
      for (let i = 0; i < posts.length; i++) {
        try {
          const post = posts[i]
          const message = [msgPrefix, post.permalink_url, msgSuffix].join('')
          const embed = this.makeFacebookPagePostEmbed({ page: data, post })
          await this.sendMessageAsBot({ discord, channels: [cid], message, embed })
        } catch (err) {
          Logger.error(err)
        }
      }
    })
  }

  makeFacebookPagePostEmbed({ page, post }) {
    const { RichEmbed } = require('discord.js')
    const embed = new RichEmbed({
      color: parseInt('007acc', 16),
      author: {
        name: page.name,
        url: `https://www.facebook.com/${page.id}`,
        icon_url: page.picture.data.url
      },
      description: post.message,
      timestamp: new Date(post.created_time),
      footer: { text: 'Facebook' }
    })
    if (post.full_picture) {
      embed.setImage(post.full_picture)
    }
    return embed
  }

  async sendMessageAsBot({ discord, channels, message, embed }) {
    //
    if ((channels || []).length === 0) return
    //
    discord.channels
      .filter(v => v.type === 'text' && channels.includes(v.id))
      .array()
      .forEach(v => v.send(message, embed)
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

  async sendMessageAsUser({ channels, message, embed }) {
    //
    if ((channels || []).length === 0) return
    //
    const token = ConfigVar.DISCORD_TOKEN_USER
    if (!token) return
    //
    const Discord = require('discord.js')
    const discord = new Discord.Client()
    const sendTotal = channels.length
    let sendCount = 0
    //
    discord.on('ready', () => {
      Logger.log(`DISCORD USER ${discord.user.tag} online!`)
      discord.channels
        .filter(v => v.type === 'text' && channels.includes(v.id))
        .array()
        .forEach(v => v.send(message, embed)
          .then(() => Logger.log(`DONE > ${v.guild.name} > #${v.name}`))
          .catch(err => Logger.error(err))
          .then(() => {
            sendCount++
            if (sendCount !== sendTotal) return
            Logger.log('DISCORD USER Disconnecting...')
            discord
              .destroy()
              .then(() => Logger.log('DISCORD USER Disconnected!'))
          })
        )
    })
    //
    Logger.log('DISCORD USER Connecting...')
    discord.login(token)
  }

}

module.exports = new DiscordHelper()
