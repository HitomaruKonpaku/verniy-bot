import { Inject, Injectable } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/services/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/services/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateTwitterSpaceStatsCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterSpaceStatsCommand.name })

  private readonly limiter = new Bottleneck({ maxConcurrent: 5 })

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
      .setName('space_stats')
      .setDescription('Space stats')
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

      const results = await Promise.allSettled(reqSpaces.map((space) => this.limiter.schedule(() => this.twitterSpaceControllerService.saveAudioSpace(space.id))))
      const fulfilledCount = results.filter((v) => v.status === 'fulfilled')
      await interaction.editReply(`Updated ${fulfilledCount.length}/${reqSpaces.length} Spaces`)
    } finally {
      this.isRunning = false
      this.logger.warn('Done!')
    }
  }
}
