/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common'
import { execSync } from 'child_process'
import { APIEmbed } from 'discord-api-types/v10'
import { ChatInputCommandInteraction, codeBlock, SlashCommandBuilder, time, User } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { AppUtils } from '../../../../utils/app.utils'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class StatusCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: StatusCommand.name })

  public static readonly command = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show bot status')

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const owner = interaction.client.application.owner as User
    const uptime = Math.floor((Date.now() - process.uptime() * 1000) / 1000)
    const commitHash = execSync('git rev-parse HEAD').toString()

    const embed: APIEmbed = {
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
          value: `[${commitHash.slice(0, 7)}](${AppUtils.getCommitUrl(commitHash)})`,
        },
      ],
    }

    await interaction.editReply({ embeds: [embed] })
  }
}
