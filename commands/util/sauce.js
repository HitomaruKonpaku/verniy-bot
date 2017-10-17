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
            url = 'http://saucenao.com/search.php?db=999&url=' + url
            request(url, {
                    transform: function(body) { return cheerio.load(body) }
                })
                .then($ => {
                    let links = []
                    $('.resulttablecontent').each(function(i, e) {
                        let percent = Number(e.firstChild.firstChild.firstChild.data.replace('%', ''))
                        if (percent < 90) return

                        $('a', $(e)).each(function(i, e) {
                            const match = [
                                /http:\/\/www.pixiv.net\/member_illust.php\?mode=medium&illust_id=\d+/,
                                /http:\/\/seiga.nicovideo.jp\/seiga\/im\d+/,
                                /https:\/\/danbooru.donmai.us\/post\/show\/\d+/,
                                /https:\/\/gelbooru.com\/index.php\?page=post&s=view&id=\d+/,
                                /https:\/\/yande.re\/post\/show\/\d+/
                            ]
                            let href = e.attribs.href
                            if (match.some(v => v.test(href))) {
                                links.push(href)
                            }
                        })
                    })

                    let embed = new RichEmbed()
                        .setColor(0x2196f3)
                        .setDescription(links.join('\n'))
                    msg.embed(embed)
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}