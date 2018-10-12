const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

const ShipType = {
    bb: 'Battleship',
    ca: 'Heavy cruiser',
    cl: 'Light cruiser',
    dd: 'Destroyer',
}

module.exports = class KCGunFitCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fit',
            aliases: [],
            group: 'kc',
            memberName: 'fit',
            description: [
                'Gun fit tables.',
                'Type must be:',
                Object.keys(ShipType)
                    .map(v => `**${v}**: ${ShipType[v]}`)
                    .join(', '),
            ].join(' '),
            args: [
                {
                    key: 'type',
                    prompt: `Ship type must be: ${Object.keys(ShipType).join(', ')}`,
                    type: 'string',
                    wait: 10,
                    validate: ((val) => Object.keys(ShipType).includes(val)),
                },
            ],
        })
    }

    async run(msg, args) {
        const message = this.getData(args.type)
        return msg.say(message)
    }

    getData(type) {
        switch (type) {
            case 'bb':
                return KC.GunFit.Battleship
            case 'ca':
            case 'cl':
                return KC.GunFit.Cruiser
            case 'dd':
                return KC.GunFit.Destroyer
        }
        return 'Invalid ship type'
    }
}