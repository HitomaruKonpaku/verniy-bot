const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const request = require('request-promise')
const oneLine = require('common-tags').oneLine

const CognitiveServices = require('../../_data/settings.json').Microsoft.CognitiveServices
const logger = require('../../lib/logger')

module.exports = class OCRCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ocr',
            group: 'cogsv',
            memberName: 'ocr',
            description: oneLine `
                Optical Character Recognition.
                Supported image formats: JPEG, PNG, GIF, BMP.
                Image file size must be less than 4MB.
                Image dimensions must be between 40 x 40 and 3200 x 3200 pixels, and the image cannot be larger than 10 megapixels.
                Supported only 1 language in 1 image.
            `,
            examples: ['ocr <image_link>', 'ocr <image_attachment>']
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
            request(CognitiveServices.Server + '/vision/v1.0/ocr', {
                    method: 'POST',
                    qs: { 'language': 'unk', 'detectOrientation': true },
                    headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': CognitiveServices.Token },
                    body: { url },
                    json: true,
                })
                .then(res => {
                    let content = res.regions.map(r => r.lines.map(l => l.words.map(w => w.text).join('')).join('\n')).join('\n')
                    msg.embed(ocrRichEmbed(true, content, url, res.language, res.orientation))
                })
                .catch(err => {
                    msg.embed(ocrRichEmbed(false, err.error.message))
                })
        } else {
            msg.embed(ocrRichEmbed(false, 'Invalid image URL'))
        }
    }
}

function ocrRichEmbed(success, message, image, language, orientation) {
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