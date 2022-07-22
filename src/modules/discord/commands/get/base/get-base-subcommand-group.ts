import { ModuleRef } from '@nestjs/core'
import { CommandInteraction } from 'discord.js'
import { Logger } from 'winston'
import { BaseCommand } from '../../base/base.command'

export abstract class GetBaseSubcommandGroup extends BaseCommand {
  protected readonly logger: Logger

  constructor(
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  protected abstract getCommandService(subcommand: string)

  public async execute(interaction: CommandInteraction) {
    this.logger.debug('execute')
    const subcommand = interaction.options.getSubcommand()
    const instance = this.moduleRef.get(this.getCommandService(subcommand))
    await instance?.execute?.(interaction)
  }
}
