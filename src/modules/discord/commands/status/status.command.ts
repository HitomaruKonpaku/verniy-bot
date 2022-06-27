/* eslint-disable class-methods-use-this */
import { codeBlock, SlashCommandBuilder, time } from '@discordjs/builders'
import { Injectable } from '@nestjs/common'
import { execSync } from 'child_process'
import { CommandInteraction, MessageEmbedOptions, User } from 'discord.js'
import { BaseCommand } from '../base/base.command'

@Injectable()
export class StatusCommand extends BaseCommand {
  public static readonly command = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show bot status')

  public async execute(interaction: CommandInteraction) {
    const owner = interaction.client.application.owner as User
    const uptime = Math.floor((Date.now() - process.uptime() * 1000) / 1000)
    const commitHash = execSync('git rev-parse HEAD').toString()

    const embed: MessageEmbedOptions = {
      color: 0x1d9bf0,
      fields: [
        {
          name: 'Owner',
          value: codeBlock(owner.tag),
        },
        {
          name: 'Uptime',
          value: time(uptime, 'R'),
        },
        {
          name: 'Commit hash',
          value: `[${commitHash.slice(0, 7)}](https://github.com/HitomaruKonpaku/verniy-bot/commit/${commitHash})`,
        },
      ],
    }

    await interaction.editReply({ embeds: [embed] })
  }
}
