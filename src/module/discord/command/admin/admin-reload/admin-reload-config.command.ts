import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { ConfigService } from '../../../../config/service/config.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class AdminReloadConfigCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: AdminReloadConfigCommand.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('config')
      .setDescription('Reload config')
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    this.configService.reload()

    await interaction.editReply('✅')
  }
}
