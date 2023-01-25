import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { EnvironmentService } from '../../../../environment/service/environment.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class AdminReloadEnvironmentCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: AdminReloadEnvironmentCommand.name })

  constructor(
    @Inject(EnvironmentService)
    private readonly environmentService: EnvironmentService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('environment')
      .setDescription('Reload environment')
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    this.environmentService.reload()

    await interaction.editReply('✅')
  }
}
