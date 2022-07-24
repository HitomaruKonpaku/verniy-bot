import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { ConfigService } from '../../../../config/services/config.service'
import { AdminBaseSubcommand } from '../base/admin-base-subcommand'

@Injectable()
export class AdminReloadConfigCommand extends AdminBaseSubcommand {
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

  public async execute(interaction: CommandInteraction) {
    await super.execute(interaction)

    this.configService.reloadConfig()

    await interaction.editReply('✅')
  }
}
