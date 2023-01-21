/* eslint-disable class-methods-use-this */
import { Inject, Injectable } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../logger'
import { BaseCommand } from '../base/base-command'
import { UpdateTwitterCommand } from './update-twitter/update-twitter.command'

@Injectable()
export class UpdateCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateCommand.name })

  constructor(
    @Inject(ModuleRef)
    protected readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  public static readonly command = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update')
    .setDefaultMemberPermissions(0)
    .addSubcommandGroup((group) => UpdateTwitterCommand.getSubcommandGroup(group))

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    if (!await this.isAppOwner(interaction)) {
      this.logger.warn('execute: blocked')
      await this.replyOwnerOnly(interaction)
      return
    }

    const group = interaction.options.getSubcommandGroup()
    const instance = this.moduleRef.get(this.getCommandService(group))
    await instance?.execute?.(interaction)
  }

  private getCommandService(group: string) {
    const instance = {
      twitter: UpdateTwitterCommand,
    }[group] || null
    return instance
  }
}
