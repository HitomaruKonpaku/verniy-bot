const { Command } = require('discord.js-commando')
const disambiguation = require('discord.js-commando/src/util').disambiguation

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help',
            group: 'util',
            memberName: 'help',
            aliases: ['commands'],
            description: 'Displays a list of available commands, or detailed information for a specified command.',
            details: [
                'The command may be part of a command name or a whole command name.',
                'If it isn \'t specified, all available commands will be listed.',
            ].join(' '),
            examples: ['help', 'help prefix'],
            guarded: true,
            args: [{
                key: 'command',
                prompt: 'Which command would you like to view the help for?',
                type: 'string',
                default: '',
            }],
        })
    }

    async run(msg, args) {
        const registry = this.client.registry
        const groups = registry.groups
        const commands = registry.findCommands(args.command, false, msg)
        let isShowAll = args.command && args.command.toLowerCase() === 'all'
        const messages = []

        if (args.command && !isShowAll) {
            if (commands.length == 1) {
                const command = commands[0]
                const helpHead = [
                    `**『${command.name}』:** ${command.description}`,
                    command.guildOnly ? ' (Usable only in servers)' : '',
                ].join(' ').trim()
                const helpBody = [
                    `**Format:** ${msg.anyUsage(`${command.name}${command.format ? ` ${command.format}` : ''}`)}`,
                    command.aliases.length > 0 ? `**Aliases:** ${command.aliases.join(', ')}` : '',
                    `**Group:** ${command.group.name} (\`${command.groupID}:${command.memberName}\`)`,
                    command.details ? `**Details:** ${command.details}` : '',
                    command.examples ? `**Examples:**\n${command.examples.join('\n')}` : '',
                ].filter(v => v !== '').join('\n').trim()
                const help = [helpHead, helpBody].join('\n\n')
                try {
                    messages.push(await msg.direct(help))
                    if (msg.channel.type !== 'dm') messages.say(await msg.say('Sent you a DM with information.'))
                } catch (err) {
                    messages.push(await msg.say('Unable to send you the help DM. You probably have DMs disabled.'))
                }
                return messages
            } else if (commands.length > 1) {
                return msg.say(disambiguation(commands, 'commands'))
            } else {
                return msg.say(
                    `Unable to identify command. Use ${msg.usage(
                        null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
                    )} to view the list of all commands.`
                )
            }
        }

        try {
            isShowAll = true
            const helpHead = [
                `To run a command in ${msg.guild || 'any server'}, use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.`,
                `For example, ${Command.usage('help', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.`,
                `To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.`,
                `\nUse ${this.usage('<command>', null, null)} to view detailed information about a specific command.`,
            ].join('\n').trim()
            const helpGroups =
                (isShowAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
                    .map(grp => [
                        `__**${grp.name}**__`,
                        (isShowAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
                            .map(cmd => `> **${cmd.name}:** ${cmd.description}`)
                            .join('\n'),
                    ].join('\n'))
                    .join('\n\n')
            const helpBody = [
                `__**${isShowAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__\n`,
                helpGroups,
            ].join('\n')
            const help = [helpHead, helpBody].join('\n\n')
            messages.push(await msg.direct(help))
            if (msg.channel.type !== 'dm') messages.push(await msg.say('Sent you a DM with information.'))
        } catch (err) {
            messages.push(await msg.say('Unable to send you the help DM. You probably have DMs disabled.'))
        }
        return messages
    }
}