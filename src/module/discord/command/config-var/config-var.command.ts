/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { BaseCommand } from '../base/base-command'
import { ConfigVarGetCommand } from './config-var-get.command'
import { ConfigVarListCommand } from './config-var-list.command'
import { ConfigVarSetCommand } from './config-var-set.command'

@Injectable()
export class ConfigVarCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: ConfigVarCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('config_var')
    .setDescription('Config var')
    .addSubcommand((subcommand) => ConfigVarListCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => ConfigVarGetCommand.getSubcommand(subcommand))
    .addSubcommand((subcommand) => ConfigVarSetCommand.getSubcommand(subcommand))
    .setDefaultMemberPermissions(0)

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    if (!await this.isAppOwner(interaction)) {
      this.logger.warn('execute: blocked')
      await this.replyOwnerOnly(interaction)
      return
    }

    const group = interaction.options.getSubcommand()
    const instance = this.moduleRef.get(this.getCommandService(group))
    await instance?.execute?.(interaction)
  }

  private getCommandService(group: string) {
    const instance = {
      list: ConfigVarListCommand,
      get: ConfigVarGetCommand,
      set: ConfigVarSetCommand,
    }[group] || null
    return instance
  }
}
