const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const request = require('request-promise')
const cheerio = require('cheerio')

module.exports = class SauceCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'sauce',
            group: 'util',
            memberName: 'sauce',
            description: 'Find the source of the given image.',
            examples: [],
        })
    }

    async run(msg, args) {
        let user = msg.author.tag,
            url = msg.attachments.size != 0 ? msg.attachments.first().url : args

        if (
            /\w+.((jpg)|(png)|(bmp)|(gif))/.test(url) &&
            /^(?:(http[s]?|ftp[s]):\/\/)?([^:\/\s]+)(:[0-9]+)?((?:\/\w+)*\/)([\w\-\.]+[^#?\s]+)([^#\s]*)?(#[\w\-]+)?$/.test(url)
        ) {
            let searchUrl = 'http://saucenao.com/search.php?db=999&url=' + url
            request(searchUrl, {
                    transform: function(body) {
                        return cheerio.load(body)
                    }
                })
                .then($ => {
                    const patterns = [
                        /pixiv.net\/member_illust.php\?mode=medium&illust_id=\d+$/,
                        /seiga.nicovideo.jp\/seiga\/im\d+$/,
                        /yande.re\/post\/show\/\d+$/,
                        /danbooru.donmai.us\/post\/show\/\d+$/,
                        /gelbooru.com\/index.php\?page=post&s=view&id=\d+$/,
                        /konachan.com\/post\/show\/\d+$/,
                        /chan.sankakucomplex.com\/post\/show\/\d+$/,
                        /anime-pictures.net\/pictures\/view_post\/\d+$/
                    ]

                    let links = []

                    $('.resulttablecontent').each(function(index, value) {
                        let matchPercent = Number(value.firstChild.firstChild.firstChild.data.replace('%', ''))
                        if (matchPercent < 90) return

                        $('a', value).each(function(index, value) {
                            let href = value.attribs.href
                            if (patterns.some(v => v.test(href))) {
                                links.push(href)
                            }
                        })
                    })

                    msg.embed(sauceRichEmbed({ success: true, links }))
                })
                .catch(err => {
                    msg.embed(sauceRichEmbed({ success: false, message: err.error.message }))
                })
        } else {
            msg.embed(ocrRichEmbed({ success: false, message: 'Invalid image URL' }))
        }
    }
}

function sauceRichEmbed({ success, links, message }) {
    let embed = new RichEmbed()
        .setColor(success && links.length > 0 ? 0x2196f3 : 0xf04747)
        .setDescription(!success ? message : links.length > 0 ? links.join('\n') : 'No match found!')
    return embed
}