/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { GetYoutubeChannelCommand } from './get-youtube-channel.command'

@Injectable()
export class GetYoutubeCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: GetYoutubeCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  public static getSubcommandGroup(group: SlashCommandSubcommandGroupBuilder) {
    return group
      .setName('youtube')
      .setDescription('YouTube')
      .addSubcommand((subcommand) => GetYoutubeChannelCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      channel: GetYoutubeChannelCommand,
    }[subcommand] || null
    return instance
  }
}
