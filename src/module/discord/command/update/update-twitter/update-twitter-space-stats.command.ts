import { Inject, Injectable } from '@nestjs/common'
import { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TwitterSpaceControllerService } from '../../../../twitter/service/controller/twitter-space-controller.service'
import { TwitterSpaceService } from '../../../../twitter/service/data/twitter-space.service'
import { BaseCommand } from '../../base/base-command'

@Injectable()
export class UpdateTwitterSpaceStatsCommand extends BaseCommand {
  protected readonly logger = baseLogger.child({ context: UpdateTwitterSpaceStatsCommand.name })

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

      const msg = await interaction.editReply('Fetching...')
      const results = await Promise.allSettled(reqSpaces.map(async (space) => {
        let isSuccess = false
        do {
          try {
            // eslint-disable-next-line no-await-in-loop
            await this.twitterSpaceControllerService.saveAudioSpace(
              space.id,
              {
                priority: 9,
                skipPlaylistUrl: !!space.playlistUrl,
              },
            )
            isSuccess = true
          } catch (error) {
            this.logger.error(`saveAudioSpace: ${error.message}`, { id: space.id })
            if (error.response?.status !== 429) {
              throw error
            }
          }
        } while (!isSuccess)
      }))

      const fulfilledCount = results.filter((v) => v.status === 'fulfilled').length
      this.logger.warn('Completed!', { total: reqSpaces.length, fulfilledCount })
      await msg.reply(`Updated ${fulfilledCount}/${reqSpaces.length} Spaces`)
    } finally {
      this.isRunning = false
      this.logger.warn('Done!')
    }
  }
}
