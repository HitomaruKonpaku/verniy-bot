/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { UpdateTwitterSpaceDataCommand } from './update-twitter-space-data.command'
import { UpdateTwitterSpaceStatsCommand } from './update-twitter-space-stats.command'

@Injectable()
export class UpdateTwitterCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  public static getSubcommandGroup(group: SlashCommandSubcommandGroupBuilder) {
    return group
      .setName('twitter')
      .setDescription('Twitter')
      .addSubcommand((subcommand) => UpdateTwitterSpaceDataCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => UpdateTwitterSpaceStatsCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      space_data: UpdateTwitterSpaceDataCommand,
      space_stats: UpdateTwitterSpaceStatsCommand,
    }[subcommand] || null
    return instance
  }
}
