/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { BaseCommand } from '../base/base-command'
import { AdminReloadCommand } from './admin-reload/admin-reload.command'

@Injectable()
export class AdminCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: AdminCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin')
    .setDefaultMemberPermissions(0)
    .addSubcommandGroup((group) => AdminReloadCommand.getSubcommandGroup(group))

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)
    const group = interaction.options.getSubcommandGroup()
    const instance = this.moduleRef.get(this.getCommandService(group))
    await instance?.execute?.(interaction)
  }

  private getCommandService(group: string) {
    const instance = {
      reload: AdminReloadCommand,
    }[group] || null
    return instance
  }
}
