/* eslint-disable class-methods-use-this */
import { SlashCommandSubcommandGroupBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { baseLogger } from '../../../../../logger'
import { AdminBaseSubcommandGroup } from '../base/admin-base-subcommand-group'
import { AdminReloadConfigCommand } from './admin-reload-config.command'
import { AdminReloadTwitterStreamRulesCommand } from './admin-reload-twitter-stream-rules.command'

@Injectable()
export class AdminReloadCommand extends AdminBaseSubcommandGroup {
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
      .addSubcommand((subcommand) => AdminReloadConfigCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => AdminReloadTwitterStreamRulesCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      config: AdminReloadConfigCommand,
      twitter_stream_rules: AdminReloadTwitterStreamRulesCommand,
    }[subcommand] || null
    return instance
  }
}
