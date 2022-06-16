import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { ConfigService } from '../../../config/services/config.service'
import { BaseCommand } from '../base/base.command'

@Injectable()
export class ConfigCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: ConfigCommand.name })

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Config')
    .addSubcommand((subcommand) => subcommand
      .setName('reload')
      .setDescription('Reload config file'))

  public async execute(interaction: CommandInteraction) {
    if (!await this.isAppOwner(interaction)) {
      this.logger.warn('execute: blocked')
      await this.replyOwnerOnly(interaction)
      return
    }

    const subcommand = interaction.options.getSubcommand()
    switch (subcommand) {
      case 'reload':
        this.configService.reloadConfig()
        await interaction.editReply('✅')
        return
      default:
        await interaction.editReply('subcommand not found')
    }
  }
}
