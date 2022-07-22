/* eslint-disable class-methods-use-this */
import { SlashCommandBuilder } from '@discordjs/builders'
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { BaseCommand } from '../base/base.command'
import { GetTwitCastingCommand } from './get-twitcasting/get-twitcasting.command'
import { GetTwitterCommand } from './get-twitter/get-twitter.command'

@Injectable()
export class GetCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: GetCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Get')
    .addSubcommandGroup((group) => group
      .setName('twitter')
      .setDescription('Twitter')
      .addSubcommand((subcommand) => subcommand
        .setName('user')
        .setDescription('User')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id'))
        .addStringOption((option) => option
          .setName('username')
          .setDescription('Username'))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('space')
        .setDescription('Space')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?'))))
    .addSubcommandGroup((group) => group
      .setName('twitcasting')
      .setDescription('TwitCasting')
      .addSubcommand((subcommand) => subcommand
        .setName('user')
        .setDescription('User')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('movie')
        .setDescription('Movie')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))
        .addBooleanOption((option) => option
          .setName('refresh')
          .setDescription('Refresh?')))
      .addSubcommand((subcommand) => subcommand
        .setName('movies_by_user')
        .setDescription('Movies by user')
        .addStringOption((option) => option
          .setName('id')
          .setDescription('Id')
          .setRequired(true))))

  public async execute(interaction: CommandInteraction) {
    this.logger.debug('execute')
    const group = interaction.options.getSubcommandGroup()
    const instance = this.moduleRef.get(this.getCommandService(group))
    await instance?.execute?.(interaction)
  }

  private getCommandService(group: string) {
    const instance = {
      twitter: GetTwitterCommand,
      twitcasting: GetTwitCastingCommand,
    }[group] || null
    return instance
  }
}
