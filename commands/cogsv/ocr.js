const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')
const request = require('request-promise')
const { oneLine } = require('common-tags')

const CognitiveServices = require('../../_data/settings.json').Microsoft.CognitiveServices
const Logger = require('../../lib/logger')

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
        let user = msg.author.tag,
            url = msg.attachments.size != 0 ? msg.attachments.first().url : args

        if (
            /.((jpg)|(png)|(bmp)|(gif))$/.test(url) &&
            /^(?:(http[s]?|ftp[s]):\/\/)?([^:\/\s]+)(:[0-9]+)?((?:\/\w+)*\/)([\w\-\.]+[^#?\s]+)([^#\s]*)?(#[\w\-]+)?$/.test(url)
        ) {
            Logger.console({ user, message: `OCR: ${url}` })
            Logger.file({ level: 'ocr', data: `REQUEST;;${user} >> ${url}` })

            request(CognitiveServices.Server + '/vision/v1.0/ocr', {
                    method: 'POST',
                    qs: { 'language': 'unk', 'detectOrientation': 'true' },
                    headers: { 'Content-Type': 'application/json', 'Ocp-Apim-Subscription-Key': CognitiveServices.Token },
                    body: { url },
                    json: true,
                })
                .then(res => {
                    Logger.file({ level: 'ocr', data: `SUCCESS;;${JSON.stringify (res)}` })
                    let message = res.regions.map(r => r.lines.map(l => l.words.map(w => w.text).join('')).join('\n')).join('\n')
                    msg.embed(ocrRichEmbed({ success: true, message: message, image: url, language: res.language, orientation: res.orientation, textAngle: res.textAngle }))
                })
                .catch(err => {
                    Logger.file({ level: 'ocr', data: `ERROR;;${err.toString ()}` })
                    msg.embed(ocrRichEmbed(false, err.error.message))
                })
        } else {
            msg.embed(ocrRichEmbed(false, 'Invalid image URL'))
        }
    }
}

function ocrRichEmbed({ success, message, image, language, orientation, textAngle }) {
    let embed = new RichEmbed()
        .setColor(success ? 0x2196f3 : 0xf04747)
        .setDescription(message)
    if (image != undefined)
        embed.setThumbnail(image)
    if (language != undefined)
        embed.addField('Language', language, false)
    if (orientation != undefined)
        embed.addField('Orientation', orientation, true)
    if (textAngle != undefined)
        embed.addField('Text Angle', textAngle, true)
    return embed
}