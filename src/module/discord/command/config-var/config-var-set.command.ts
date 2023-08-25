import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class ConfigVarSetCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: ConfigVarSetCommand.name })

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('set')
      .setDescription('Set')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('value')
        .setDescription('Value')
        .setRequired(true))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id', true)
    const value = interaction.options.getString('value', true)
    await this.configVarService.set(id, value)

    const configVar = await this.configVarService.findOneById(id)
    if (!configVar) {
      await interaction.editReply('Not found')
      return
    }

    await this.replyObject(interaction, configVar)
  }
}
