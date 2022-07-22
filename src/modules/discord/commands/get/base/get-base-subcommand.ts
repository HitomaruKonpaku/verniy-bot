/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommandInteraction } from 'discord.js'
import { Logger } from 'winston'
import { BaseCommand } from '../../base/base.command'

export abstract class GetBaseSubcommand extends BaseCommand {
  protected readonly logger: Logger

  public async execute(interaction: CommandInteraction) {
    this.logger.debug('execute')
  }
}
