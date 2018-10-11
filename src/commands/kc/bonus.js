const { Command } = require('discord.js-commando')
const KC = require('../../settings').KanColle

const EquipmentType = {
    all: 'All',
    sg: 'Small gun',
    lg: 'Large gun',
    tp: 'Torpedo',
    ac: 'Aircraft',
    o: 'Other',
}

module.exports = class KCEquipmentBonusCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bonus',
            aliases: ['bn', 'ebn', 'eq'],
            group: 'kc',
            memberName: 'bonus',
            description: [
                'Equipment bonus tables.',
                'Type must be:',
                Object.keys(EquipmentType)
                    .map(v => `**${v}**: ${EquipmentType[v]}`)
                    .join(', '),
            ].join(' '),
            args: [
                {
                    key: 'type',
                    prompt: 'Equipment type?',
                    type: 'string',
                    wait: 10,
                    validate: ((val) => Object.keys(EquipmentType).includes(val)),
                },
            ],
        })
    }

    async run(msg, args) {
        const message = this.getBonusSource(args.type)
        return msg.say(message)
    }

    getBonusSource(type) {
        switch (type) {
            case 'all':
                return KC.Bonus.All
            case 'sg':
                return KC.Bonus.SmallGun
            case 'lg':
                return KC.Bonus.LargeGun
            case 'tp':
                return KC.Bonus.Torpedo
            case 'ac':
                return KC.Bonus.Aircraft
            case 'o':
                return KC.Bonus.Other
        }
    }
}