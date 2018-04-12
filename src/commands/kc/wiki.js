const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle
const Wikia = require('../../modules/wikia-api')

module.exports = class KCWikiCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'wiki',
            group: 'kc',
            memberName: 'wiki',
            description: 'KanColle wikia search',
        })
    }

    async run(msg, args) {
        Wikia.searchSuggestions({ domain: 'kancolle', query: args })
            .then(data => {
                var base = KC.Wikia
                var links = []
                data.items.forEach(v => {
                    links.push(`<${base + encodeURI(v.title)}>`)
                })
                msg.channel.send(links.join('\n'))
            })
    }
}