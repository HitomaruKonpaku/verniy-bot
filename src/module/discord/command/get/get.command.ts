/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { BaseCommand } from '../base/base-command'
import { GetTwitCastingCommand } from './get-twitcasting/get-twitcasting.command'
import { GetTwitchCommand } from './get-twitch/get-twitch.command'
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
    .addSubcommandGroup((group) => GetTwitterCommand.getSubcommandGroup(group))
    .addSubcommandGroup((group) => GetTwitCastingCommand.getSubcommandGroup(group))
    .addSubcommandGroup((group) => GetTwitchCommand.getSubcommandGroup(group))

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)
    const group = interaction.options.getSubcommandGroup()
    const instance = this.moduleRef.get(this.getCommandService(group))
    await instance?.execute?.(interaction)
  }

  private getCommandService(group: string) {
    const instance = {
      twitter: GetTwitterCommand,
      twitcasting: GetTwitCastingCommand,
      twitch: GetTwitchCommand,
    }[group] || null
    return instance
  }
}
