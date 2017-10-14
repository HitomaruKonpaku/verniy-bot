const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const request = require('request-promise')

const logger = require('../../logger')
const token = require('../../settings.json').Microsoft.CognitiveServices.Token

module.exports = class ReplyCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ocr',
            group: 'cogsv',
            memberName: 'ocr',
            description: 'Optical Character Recognition',
            examples: ['ocr <image_link>']
        })
    }

    async run(msg, args) {
        let url,
            user = msg.author.username + '@' + msg.author.discriminator

        if (msg.attachments.size != 0) {
            url = msg.attachments.first().url
        } else {
            url = args
        }

        logger.log(url, user)

        if (
            /.((jpg)|(png)|(bmp)|(gif))$/.test(url) &&
            /^(?:(http[s]?|ftp[s]):\/\/)?([^:\/\s]+)(:[0-9]+)?((?:\/\w+)*\/)([\w\-\.]+[^#?\s]+)([^#\s]*)?(#[\w\-]+)?$/.test(url)
        ) {
            request('https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/ocr', {
                    method: 'POST',
                    qs: {
                        'language': 'unk',
                        'detectOrientation': 'true',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': token,
                    },
                    body: {
                        url,
                    },
                    json: true,
                })
                .then(res => {
                    var content = res.regions.map(
                        r => r.lines.map(
                            l => l.words.map(
                                w => w.text
                            ).join('')
                        ).join('\n')
                    ).join('\n')

                    msg.embed(getRichEmbed(true, content, url, res.language, res.orientation))
                })
                .catch(err => {
                    msg.embed(getRichEmbed(false, err.error.message))
                })
        } else {
            msg.embed(getRichEmbed(false, 'Invalid image URL'))
        }
    }
}

function getRichEmbed(success, message, image, language, orientation) {
    let embed = new RichEmbed()
        .setColor(success ? 0x2196f3 : 0xf04747)
        .setDescription(message)
    if (image)
        embed.setThumbnail(image)
    if (language)
        embed.addField('Language', language, true)
    if (orientation)
        embed.addField('Orientation', orientation, true)
    return embed
}