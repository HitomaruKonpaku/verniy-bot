import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder, codeBlock } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class ConfigVarListCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: ConfigVarListCommand.name })

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('list')
      .setDescription('List')
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const ids = this.configVarService.getIds()
      .sort((a, b) => a.localeCompare(b))

    const content = codeBlock(ids.join('\n'))

    await interaction.editReply(content)
  }
}
