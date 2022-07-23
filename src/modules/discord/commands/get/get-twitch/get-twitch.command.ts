/* eslint-disable class-methods-use-this */
import { SlashCommandSubcommandGroupBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { baseLogger } from '../../../../../logger'
import { GetBaseSubcommandGroup } from '../base/get-base-subcommand-group'
import { GetTwitchUserCommand } from './get-twitch-user.command'

@Injectable()
export class GetTwitchCommand extends GetBaseSubcommandGroup {
  protected readonly logger = baseLogger.child({ context: GetTwitchCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  public static getSubcommandGroup(group: SlashCommandSubcommandGroupBuilder) {
    return group
      .setName('twitch')
      .setDescription('Twitch')
      .addSubcommand((subcommand) => GetTwitchUserCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      user: GetTwitchUserCommand,
    }[subcommand] || null
    return instance
  }
}
