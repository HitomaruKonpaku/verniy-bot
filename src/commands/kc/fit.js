const { Command } = require('discord.js-commando')

const ShipType = {
  BB: 'Battleship',
  CA: 'Heavy cruiser',
  CL: 'Light cruiser',
  DD: 'Destroyer'
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
          .join(', ')
      ].join(' '),
      args: [
        {
          key: 'type',
          prompt: `Ship type must be: ${Object.keys(ShipType).join(', ')}`,
          type: 'string',
          wait: 10,
          validate: ((val) => Object.keys(ShipType).includes(val.toUpperCase()))
        }
      ]
    })
  }

  async run(msg, args) {
    const message = this.getData(args.type)
    return msg.say(message)
  }

  getData(type) {
    const KC = AppConfig.KanColle
    switch (type.toUpperCase()) {
      case 'BB':
        return KC.GunFit.Battleship
      case 'CA':
      case 'CL':
        return KC.GunFit.Cruiser
      case 'DD':
        return KC.GunFit.Destroyer
    }
    return 'Invalid ship type'
  }
}
