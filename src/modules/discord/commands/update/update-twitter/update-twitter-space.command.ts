import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/services/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/services/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateTwitterSpaceCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterSpaceCommand.name })

  private isRunning = false

  constructor(
    @Inject(TwitterSpaceService)
    protected readonly twitterSpaceService: TwitterSpaceService,
    @Inject(TwitterSpaceControllerService)
    protected readonly twitterSpaceControllerService: TwitterSpaceControllerService,
  ) {
    super()
  }

  public static getSubcommand(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand
      .setName('space')
      .setDescription('Space')
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    await super.execute(interaction)

    if (this.isRunning) {
      await interaction.editReply('Running...')
      return
    }

    const reqSpaces = await this.twitterSpaceService.getAllActive()
    if (!reqSpaces.length) {
      await interaction.editReply('Space(s) not found')
      return
    }

    try {
      this.isRunning = true
      this.logger.warn('Fetching...')

      const resSpaces = await this.twitterSpaceControllerService.getAllByIds(reqSpaces.map((v) => v.id))
      await interaction.editReply(`Updated ${resSpaces.length}/${reqSpaces.length} Spaces`)
    } finally {
      this.isRunning = false
      this.logger.warn('Done!')
    }
  }
}
