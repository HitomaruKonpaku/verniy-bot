/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { SlashCommandSubcommandGroupBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { BaseSubcommandGroupCommand } from '../../base/base-subcommand-group-command'
import { GetTwitCastingMovieCommand } from './get-twitcasting-movie.command'
import { GetTwitCastingMoviesByUserCommand } from './get-twitcasting-movies-by-user.command'
import { GetTwitCastingUserCommand } from './get-twitcasting-user.command'

@Injectable()
export class GetTwitCastingCommand extends BaseSubcommandGroupCommand {
  protected readonly logger = baseLogger.child({ context: GetTwitCastingCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super(moduleRef)
  }

  public static getSubcommandGroup(group: SlashCommandSubcommandGroupBuilder) {
    return group
      .setName('twitcasting')
      .setDescription('TwitCasting')
      .addSubcommand((subcommand) => GetTwitCastingUserCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => GetTwitCastingMovieCommand.getSubcommand(subcommand))
      .addSubcommand((subcommand) => GetTwitCastingMoviesByUserCommand.getSubcommand(subcommand))
  }

  protected getCommandService(subcommand: string) {
    const instance = {
      user: GetTwitCastingUserCommand,
      movie: GetTwitCastingMovieCommand,
      movies_by_user: GetTwitCastingMoviesByUserCommand,
    }[subcommand] || null
    return instance
  }
}
