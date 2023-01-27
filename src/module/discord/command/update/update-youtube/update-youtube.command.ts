/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { UpdateYoutubeChannelCommand } from './update-youtube-channel.command'

@Injectable()
export class UpdateYoutubeCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: UpdateYoutubeCommand.name })

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
      .addSubcommand((subcommand) => UpdateYoutubeChannelCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      channel: UpdateYoutubeChannelCommand,
    }[subcommand] || null
    return instance
  }
}
