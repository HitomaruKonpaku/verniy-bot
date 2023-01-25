import { ModuleRef } from '@nestjs/core'
import { ChatInputCommandInteraction } from 'discord.js'
import { BaseCommand } from './base-command'

export abstract class BaseSubcommandGroupCommand extends BaseCommand {
  constructor(
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  protected abstract getCommandService(subcommand: string)

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)
    const subcommand = interaction.options.getSubcommand()
    const instance = this.moduleRef.get(this.getCommandService(subcommand))
    await instance?.execute?.(interaction)
  }
}
