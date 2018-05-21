const { Command } = require('discord.js-commando')

module.exports = class KCExpsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'exps',
            group: 'kc',
            memberName: 'exps',
            description: 'Check total exp of shipfu',
        })
    }

    async run(msg) {
        const message = [
            'Open KC3 > Strat Room > Console (press F12) & paste the below code',
            '```js',
            'var exp = 0',
            'for (var ship in KC3ShipManager.list) exp += KC3ShipManager.list[ship].exp[0]',
            'exp.toLocaleString()',
            '```',
        ].join('\n')
        return msg.say(message)
    }
}