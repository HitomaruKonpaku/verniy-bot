/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { AdminReloadConfigCommand } from './admin-reload-config.command'
import { AdminReloadEnvironmentCommand } from './admin-reload-environment.command'
import { AdminReloadTwitterStreamRulesCommand } from './admin-reload-twitter-stream-rules.command'

@Injectable()
export class AdminReloadCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: AdminReloadCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  public static getSubcommandGroup(group: SlashCommandSubcommandGroupBuilder) {
    return group
      .setName('reload')
      .setDescription('Reload')
      .addSubcommand((subcommand) => AdminReloadEnvironmentCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => AdminReloadConfigCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => AdminReloadTwitterStreamRulesCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      environment: AdminReloadEnvironmentCommand,
      config: AdminReloadConfigCommand,
      twitter_stream_rules: AdminReloadTwitterStreamRulesCommand,
    }[subcommand] || null
    return instance
  }
}
