/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { GetTwitterBroadcastCommand } from './get-twitter-broadcast.command'
import { GetTwitterSpaceCommand } from './get-twitter-space.command'
import { GetTwitterUserCommand } from './get-twitter-user.command'

@Injectable()
export class GetTwitterCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitterCommand.name })

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
      .addSubcommand((subcommand) => GetTwitterUserCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => GetTwitterSpaceCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => GetTwitterBroadcastCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      user: GetTwitterUserCommand,
      space: GetTwitterSpaceCommand,
      broadcast: GetTwitterBroadcastCommand,
    }[subcommand] || null
    return instance
  }
}
