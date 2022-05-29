import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TrackTwitCastingLiveService } from '../../../../track/services/track-twitcasting-live.service'
import { TwitCastingUserControllerService } from '../../../../twitcasting/services/controller/twitcasting-user-controller.service'
import { TwitCastingUtils } from '../../../../twitcasting/utils/twitcasting.utils'
import { BaseCommand } from '../../base/base.command'

@Injectable()
export class TrackAddTwitCastingLiveCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackAddTwitCastingLiveCommand.name })

  constructor(
    @Inject(TwitCastingUserControllerService)
    private readonly twitCastingUserControllerService: TwitCastingUserControllerService,
    @Inject(TrackTwitCastingLiveService)
    private readonly trackTwitCastingLiveService: TrackTwitCastingLiveService,
  ) {
    super()
  }

  public async execute(interaction: CommandInteraction) {
    const { channelId } = interaction
    const message = interaction.options.getString('message') || null
    const username = interaction.options.getString('username', true)
    const meta = { username, channelId }
    this.logger.debug('--> execute', meta)

    try {
      const user = await this.twitCastingUserControllerService.getOneAndSaveById(username)
      await this.trackTwitCastingLiveService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('execute: added', meta)
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.screenId}](${TwitCastingUtils.getUserUrl(user.screenId)})**`,
          color: 0x1d9bf0,
        }],
      })
    } catch (error) {
      this.logger.error(`execute: ${error.message}`, meta)
      await interaction.editReply(error.message)
    }

    this.logger.debug('<-- execute', meta)
  }
}
