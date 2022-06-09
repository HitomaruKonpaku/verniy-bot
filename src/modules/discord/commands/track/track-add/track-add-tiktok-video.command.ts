import { Inject, Injectable } from '@nestjs/common'
import { CommandInteraction } from 'discord.js'
import { baseLogger } from '../../../../../logger'
import { TiktokUserControllerService } from '../../../../tiktok/services/controller/tiktok-user-controller.service'
import { TiktokUtils } from '../../../../tiktok/utils/tiktok.utils'
import { TrackTiktokVideoService } from '../../../../track/services/track-tiktok-video.service'
import { BaseCommand } from '../../base/base.command'

@Injectable()
export class TrackAddTiktokVideoCommand extends BaseCommand {
  private readonly logger = baseLogger.child({ context: TrackAddTiktokVideoCommand.name })

  constructor(
    @Inject(TiktokUserControllerService)
    private readonly tiktokUserControllerService: TiktokUserControllerService,
    @Inject(TrackTiktokVideoService)
    private readonly trackTiktokVideoService: TrackTiktokVideoService,
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
      const user = await this.tiktokUserControllerService.fetchUser(username)
      if (!user) {
        await this.replyUserNotFound(interaction)
        return
      }
      await this.trackTiktokVideoService.add(
        user.id,
        channelId,
        message,
        interaction.user.id,
      )
      this.logger.warn('execute: added', meta)
      await interaction.editReply({
        embeds: [{
          description: `Tracking **[${user.username}](${TiktokUtils.getUserUrl(user.username)})** TikTok`,
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
