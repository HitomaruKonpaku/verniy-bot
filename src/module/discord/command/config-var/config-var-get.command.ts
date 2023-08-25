import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { ConfigVarService } from '../../../config-var/service/config-var.service'
import { BaseCommand } from '../base/base-command'

@Injectable()
export class ConfigVarGetCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: ConfigVarGetCommand.name })

  constructor(
    @Inject(ConfigVarService)
    private readonly configVarService: ConfigVarService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('get')
      .setDescription('Get')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('Id')
        .setRequired(true))
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    const id = interaction.options.getString('id', true)

    const configVar = await this.configVarService.findOneById(id)
    if (!configVar) {
      await interaction.editReply('Not found')
      return
    }

    await this.replyObject(interaction, configVar)
  }
}
