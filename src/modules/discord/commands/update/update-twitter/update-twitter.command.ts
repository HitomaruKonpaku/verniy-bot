/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { UpdateTwitterSpaceCommand } from './update-twitter-space.command'

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
      .addSubcommand((subcommand) => UpdateTwitterSpaceCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      space: UpdateTwitterSpaceCommand,
    }[subcommand] || null
    return instance
  }
}
